import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { House } from './house.entity';
import { CreateHouseDto } from './dto/create-house.dto';
import { UpdateHouseDto } from './dto/update-house.dto';
import { borrarImagen, generarImagenCasa } from './imagen-casa';
import { publicIdDesdeUrl } from '../imagenes/cloudinary';

// Las casas que crean las pruebas E2E (código "QA-<milisegundos>") se borran a los 15 días, con su
// imagen, para que no se acumulen en la base ni en Cloudinary.
const DIAS_RETENCION_QA = 15;
const SIN_IMAGEN = { $or: [{ image: { $exists: false } }, { image: null }, { image: '' }] };

// Quién está pidiendo la operación, para chequear ownership. Un admin
// (isAdmin: true) puede editar/borrar la casa de cualquiera.
export interface ActorUsuario {
  userId: string;
  isAdmin: boolean;
}

@Injectable()
export class HousesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(HousesService.name);

  constructor(
    @InjectModel('House') private readonly houseModel: Model<House>,
  ) {}

  /**
   * Al arrancar, sin demorar el inicio: depura las casas de prueba vencidas y genera la imagen de
   * las casas que no tienen (incluidas las creadas antes de esta función). Es idempotente.
   */
  onApplicationBootstrap(): void {
    if (process.env.NODE_ENV === 'test') return;
    setTimeout(() => {
      void this.depurarCasasDePrueba()
        .then(() => this.completarImagenes())
        .catch((e) => this.logger.error(`Mantenimiento de casas falló: ${e?.message}`));
    }, 3000);
  }

  async completarImagenes(limite = 200): Promise<number> {
    const pendientes = await this.houseModel.find(SIN_IMAGEN).limit(limite);
    let hechas = 0;
    for (const casa of pendientes) {
      try {
        const image = await generarImagenCasa(casa.toObject() as any);
        await this.houseModel.updateOne({ _id: casa._id }, { image, imageAuto: true });
        hechas++;
      } catch (e: any) {
        this.logger.warn(`No se generó la imagen de ${casa.code}: ${e?.message}`);
      }
    }
    if (hechas) this.logger.log(`Imágenes generadas para ${hechas} casas`);
    return hechas;
  }

  async depurarCasasDePrueba(ahora = Date.now()): Promise<number> {
    const limite = ahora - DIAS_RETENCION_QA * 24 * 3600 * 1000;
    const pruebas = await this.houseModel.find({ code: /^QA-\d{13}$/ }, { code: 1, image: 1 });
    let borradas = 0;
    for (const casa of pruebas) {
      if (Number(casa.code.slice(3)) >= limite) continue;
      await borrarImagen(publicIdDesdeUrl(casa.image)).catch(() => undefined);
      await this.houseModel.deleteOne({ _id: casa._id });
      borradas++;
    }
    if (borradas) this.logger.log(`Casas de prueba depuradas: ${borradas}`);
    return borradas;
  }

  async create(
    createHouseDto: CreateHouseDto,
    ownerId: string,
  ): Promise<House> {
    const conImagen = Boolean(createHouseDto.image);
    const newHouse = await new this.houseModel({ ...createHouseDto, ownerId, imageAuto: false }).save();
    if (conImagen) return newHouse;
    // Sin imagen subida: se genera una automáticamente (si falla, la casa queda creada igual)
    try {
      newHouse.set({ image: await generarImagenCasa(newHouse.toObject() as any), imageAuto: true });
      return await newHouse.save();
    } catch (e: any) {
      this.logger.warn(`No se generó la imagen de ${newHouse.code}: ${e?.message}`);
      return newHouse;
    }
  }

  async findAll(): Promise<House[]> {
    return this.houseModel.find();
  }

  // CORRECCIÓN: el frontend original identifica las casas por su `code`
  // legible (ej. "H-1024"), no por el _id interno de Mongo — así llama a
  // getHouseByCode/updateHouse/deleteHouse. Usar findById aquí habría
  // fallado siempre (CastError) porque "code" no es un ObjectId válido.
  async findOne(code: string): Promise<House> {
    const house = await this.houseModel.findOne({ code });
    if (!house) {
      throw new NotFoundException('Casa no encontrada');
    }
    return house;
  }

  // CORRECCIÓN: en el original este método tenía un `catch` sin `try` y el
  // método `delete` completo estaba anidado (mal indentado) dentro de este
  // — es decir, el archivo original no compilaba tal cual estaba.
  async update(
    code: string,
    updateHouseDto: UpdateHouseDto,
    actor: ActorUsuario,
  ): Promise<House> {
    const house = await this.findOne(code);
    this.assertOwnerOrAdmin(house, actor);
    // Solo cuenta como subida una imagen distinta de la actual (el formulario reenvía la que ya tiene)
    const subida = Boolean((updateHouseDto as any).image) && (updateHouseDto as any).image !== (house as any).image;
    const cambios: Record<string, unknown> = { ...updateHouseDto };
    if (subida) cambios.imageAuto = false;
    else delete cambios.image;
    const updated = await this.houseModel.findOneAndUpdate({ code }, cambios, { new: true });
    if (!updated) {
      throw new NotFoundException('Casa no encontrada');
    }
    // Una imagen subida reemplaza a la generada (que se borra); si la imagen es generada o no hay
    // imagen, se rehace con los datos nuevos de la casa
    if (subida && (house as any).imageAuto) {
      await borrarImagen(publicIdDesdeUrl((house as any).image)).catch(() => undefined);
    }
    if (!subida && ((updated as any).imageAuto || !updated.image)) {
      try {
        if ((updated as any).code !== (house as any).code && (house as any).imageAuto) {
          await borrarImagen(publicIdDesdeUrl((house as any).image)).catch(() => undefined);
        }
        updated.set({ image: await generarImagenCasa(updated.toObject() as any), imageAuto: true });
        return await updated.save();
      } catch (e: any) {
        this.logger.warn(`No se regeneró la imagen de ${updated.code}: ${e?.message}`);
      }
    }
    return updated;
  }

  async delete(code: string, actor: ActorUsuario): Promise<boolean> {
    const house = await this.findOne(code);
    this.assertOwnerOrAdmin(house, actor);
    const deleted = await this.houseModel.findOneAndDelete({ code });
    if (!deleted) {
      throw new NotFoundException('Casa no encontrada');
    }
    // Sin huérfanos: la imagen de la casa (generada o subida) se borra de Cloudinary
    await borrarImagen(publicIdDesdeUrl(deleted.image)).catch((e) =>
      this.logger.warn(`No se borró la imagen de ${code}: ${e?.message}`),
    );
    return true;
  }

  // Las casas creadas antes de agregar ownerId no tienen dueño asignado --
  // para no romper datos viejos, en ese caso cualquier usuario autenticado
  // puede seguir editándolas/borrándolas (comportamiento previo). Las casas
  // nuevas sí exigen ser el dueño, salvo que el actor sea admin.
  private assertOwnerOrAdmin(house: House, actor: ActorUsuario): void {
    const ownerId = (house as any).ownerId;
    if (!ownerId) return;
    if (actor.isAdmin || ownerId === actor.userId) return;
    throw new ForbiddenException('Solo el dueño de la casa o un admin puede modificarla');
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { House } from './house.entity';
import { CreateHouseDto } from './dto/create-house.dto';
import { UpdateHouseDto } from './dto/update-house.dto';

// Quién está pidiendo la operación, para chequear ownership. Un admin
// (isAdmin: true) puede editar/borrar la casa de cualquiera.
export interface ActorUsuario {
  userId: string;
  isAdmin: boolean;
}

@Injectable()
export class HousesService {
  constructor(
    @InjectModel('House') private readonly houseModel: Model<House>,
  ) {}

  async create(
    createHouseDto: CreateHouseDto,
    ownerId: string,
  ): Promise<House> {
    const newHouse = new this.houseModel({ ...createHouseDto, ownerId });
    return newHouse.save();
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
    const updated = await this.houseModel.findOneAndUpdate(
      { code },
      updateHouseDto,
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('Casa no encontrada');
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

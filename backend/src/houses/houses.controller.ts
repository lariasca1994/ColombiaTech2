import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { House } from './house.entity';
import { CreateHouseDto } from './dto/create-house.dto';
import { UpdateHouseDto } from './dto/update-house.dto';
import { HousesService } from './houses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Decisión de diseño: navegar el catálogo de casas (GET) es público —
// cualquier visitante puede ver los anuncios, como en un sitio real de
// alquiler. Crear, editar o borrar sí requiere estar autenticado.
//
// Nota: :code identifica la casa por su código legible (ej. "H-1024"),
// no por el _id de Mongo — así es como ya lo espera el frontend.
@Controller('house')
export class HousesController {
  constructor(private readonly housesService: HousesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(201)
  async create(@Body() createHouseDto: CreateHouseDto): Promise<House> {
    return this.housesService.create(createHouseDto);
  }

  @Get()
  async findAll(): Promise<House[]> {
    return this.housesService.findAll();
  }

  @Get(':code')
  async findOne(@Param('code') code: string): Promise<House> {
    return this.housesService.findOne(code);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':code')
  async update(
    @Param('code') code: string,
    @Body() updateHouseDto: UpdateHouseDto,
  ): Promise<House> {
    return this.housesService.update(code, updateHouseDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':code')
  async delete(@Param('code') code: string): Promise<boolean> {
    return this.housesService.delete(code);
  }
}

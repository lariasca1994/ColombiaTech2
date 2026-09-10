import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// CORRECCIÓN: antes cualquier usuario autenticado podía ver la lista
// completa de usuarios y los datos de cualquiera. Ahora un usuario solo
// puede ver/editar/borrar su propia cuenta — no existe rol de admin en
// este proyecto, así que "propio" es la única regla.
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  // Ya no existe un endpoint que liste a todos los usuarios.

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req): Promise<User> {
    this.assertOwnAccount(id, req);
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ): Promise<User> {
    this.assertOwnAccount(id, req);
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req): Promise<boolean> {
    this.assertOwnAccount(id, req);
    return this.usersService.delete(id);
  }

  private assertOwnAccount(id: string, req: any): void {
    if (req.user?.userId !== id) {
      throw new ForbiddenException('Solo puedes ver o modificar tu propia cuenta');
    }
  }
}

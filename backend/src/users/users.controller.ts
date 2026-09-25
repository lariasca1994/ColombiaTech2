import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Patch,
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
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

// Un usuario normal solo puede ver/editar/borrar su propia cuenta. Un
// admin (role: 'admin', asignado solo vía src/scripts/crear-admin.ts) puede
// además ver/editar/borrar cualquier cuenta y suspenderlas o reactivarlas.
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req): Promise<User> {
    this.assertOwnAccountOrAdmin(id, req);
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ): Promise<User> {
    this.assertOwnAccountOrAdmin(id, req);
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req): Promise<boolean> {
    this.assertOwnAccountOrAdmin(id, req);
    return this.usersService.delete(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/suspender')
  async suspender(@Param('id') id: string): Promise<User> {
    return this.usersService.setActive(id, false);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/activar')
  async activar(@Param('id') id: string): Promise<User> {
    return this.usersService.setActive(id, true);
  }

  private assertOwnAccountOrAdmin(id: string, req: any): void {
    const isOwner = req.user?.userId === id;
    const isAdmin = req.user?.role === 'admin';
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Solo puedes ver o modificar tu propia cuenta');
    }
  }
}

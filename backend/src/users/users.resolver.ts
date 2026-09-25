import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

// Mismo criterio que en users.controller.ts: un usuario normal solo puede
// ver/editar/borrar su propia cuenta; un admin puede hacerlo con cualquiera
// y además listar todas las cuentas.
@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  createUser(@Args('input') input: CreateUserDto) {
    return this.usersService.create(input);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Query(() => [User])
  users() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User)
  user(@Args('id', { type: () => ID }) id: string, @Context() context) {
    this.assertOwnAccountOrAdmin(id, context);
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User)
  updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateUserDto,
    @Context() context,
  ) {
    this.assertOwnAccountOrAdmin(id, context);
    return this.usersService.update(id, input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  deleteUser(@Args('id', { type: () => ID }) id: string, @Context() context) {
    this.assertOwnAccountOrAdmin(id, context);
    return this.usersService.delete(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Mutation(() => User)
  suspenderUsuario(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.setActive(id, false);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Mutation(() => User)
  activarUsuario(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.setActive(id, true);
  }

  private assertOwnAccountOrAdmin(id: string, context: any): void {
    const user = context?.req?.user;
    if (user?.userId !== id && user?.role !== 'admin') {
      throw new ForbiddenException('Solo puedes ver o modificar tu propia cuenta');
    }
  }
}

import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Mismo criterio que en users.controller.ts: sin rol de admin, cada
// usuario solo puede ver/editar/borrar su propia cuenta. Ya no existe
// una query que devuelva a todos los usuarios.
@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  createUser(@Args('input') input: CreateUserDto) {
    return this.usersService.create(input);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User)
  user(@Args('id', { type: () => ID }) id: string, @Context() context) {
    this.assertOwnAccount(id, context);
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User)
  updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateUserDto,
    @Context() context,
  ) {
    this.assertOwnAccount(id, context);
    return this.usersService.update(id, input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  deleteUser(@Args('id', { type: () => ID }) id: string, @Context() context) {
    this.assertOwnAccount(id, context);
    return this.usersService.delete(id);
  }

  private assertOwnAccount(id: string, context: any): void {
    const userId = context?.req?.user?.userId;
    if (userId !== id) {
      throw new ForbiddenException('Solo puedes ver o modificar tu propia cuenta');
    }
  }
}

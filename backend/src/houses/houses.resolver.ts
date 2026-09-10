import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { HousesService } from './houses.service';
import { House } from './house.entity';
import { CreateHouseDto } from './dto/create-house.dto';
import { UpdateHouseDto } from './dto/update-house.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Resolver(() => House)
export class HousesResolver {
  constructor(private readonly housesService: HousesService) {}

  @Query(() => [House])
  houses() {
    return this.housesService.findAll();
  }

  // Nota: code es el código legible de la casa (ej. "H-1024"), no un
  // ObjectId de Mongo — por eso es un String, no un ID de GraphQL.
  @Query(() => House)
  house(@Args('code') code: string) {
    return this.housesService.findOne(code);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => House)
  createHouse(@Args('input') input: CreateHouseDto) {
    return this.housesService.create(input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => House)
  updateHouse(
    @Args('code') code: string,
    @Args('input') input: UpdateHouseDto,
  ) {
    return this.housesService.update(code, input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  deleteHouse(@Args('code') code: string) {
    return this.housesService.delete(code);
  }
}

import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class House {
  @Field(() => ID)
  id: string;

  @Field()
  address: string;

  @Field()
  city: string;

  @Field()
  state: string;

  @Field(() => Float)
  size: number;

  @Field()
  type: string;

  @Field()
  zip_code: string;

  @Field(() => Int)
  rooms: number;

  @Field(() => Int)
  bathrooms: number;

  @Field()
  parking: string;

  @Field(() => Float)
  price: number;

  @Field()
  code: string;

  @Field({ nullable: true })
  image?: string;
}

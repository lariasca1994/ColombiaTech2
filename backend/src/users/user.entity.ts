import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  lastname?: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  avatar?: string;

  // Intencionalmente NO tiene @Field(): el password nunca debe poder
  // pedirse desde una query de GraphQL, igual que se excluye en REST.
  password?: string;
}

import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../users/user.entity';

@ObjectType()
export class Message {
  @Field(() => ID)
  id: string;

  @Field()
  body: string;

  @Field(() => User)
  from: User;

  @Field(() => User)
  to: User;

  @Field()
  readed: boolean;

  @Field({ nullable: true })
  createdAt?: Date;
}

import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Message } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Resolver(() => Message)
@UseGuards(JwtAuthGuard)
export class MessagesResolver {
  constructor(private readonly messagesService: MessagesService) {}

  @Query(() => [Message])
  messages() {
    return this.messagesService.findAll();
  }

  @Query(() => Message)
  message(@Args('id', { type: () => ID }) id: string) {
    return this.messagesService.findOne(id);
  }

  @Mutation(() => Message)
  createMessage(@Args('input') input: CreateMessageDto) {
    return this.messagesService.create(input);
  }

  @Mutation(() => Message)
  updateMessage(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateMessageDto,
  ) {
    return this.messagesService.update(id, input);
  }

  @Mutation(() => Boolean)
  deleteMessage(@Args('id', { type: () => ID }) id: string) {
    return this.messagesService.remove(id);
  }
}

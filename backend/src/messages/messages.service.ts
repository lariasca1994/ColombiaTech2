import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel('Message') private readonly messageModel: Model<Message>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const created = await new this.messageModel(createMessageDto).save();
    const result = await this.populated(created.id);
    if (!result) {
      throw new InternalServerErrorException('No se pudo recuperar el mensaje recién creado');
    }
    return result;
  }

  async findAll(): Promise<Message[]> {
    return this.messageModel
      .find()
      .populate({ path: 'from', select: '-password' })
      .populate({ path: 'to', select: '-password' })
      .sort({ createdAt: 1 });
  }

  async findOne(id: string): Promise<Message> {
    const message = await this.populated(id);
    if (!message) {
      throw new NotFoundException('Mensaje no encontrado');
    }
    return message;
  }

  async update(id: string, updateMessageDto: UpdateMessageDto): Promise<Message> {
    const updated = await this.messageModel.findByIdAndUpdate(
      id,
      updateMessageDto,
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('Mensaje no encontrado');
    }
    const result = await this.populated(id);
    if (!result) {
      throw new NotFoundException('Mensaje no encontrado');
    }
    return result;
  }

  async remove(id: string): Promise<boolean> {
    const deleted = await this.messageModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('Mensaje no encontrado');
    }
    return true;
  }

  private populated(id: string) {
    return this.messageModel
      .findById(id)
      .populate({ path: 'from', select: '-password' })
      .populate({ path: 'to', select: '-password' });
  }
}
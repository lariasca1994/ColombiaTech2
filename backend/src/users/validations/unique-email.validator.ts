import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user.entity';

@ValidatorConstraint({ name: 'UniqueEmail', async: true })
@Injectable()
export class UniqueEmailValidator implements ValidatorConstraintInterface {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async validate(email: string): Promise<boolean> {
    const existing = await this.userModel.findOne({ email });
    return !existing;
  }

  defaultMessage(): string {
    return 'El correo ya fue registrado';
  }
}

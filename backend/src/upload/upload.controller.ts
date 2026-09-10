import {
  Controller,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from '../users/users.service';
import { HousesService } from '../houses/houses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const imageStorage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

const imageFileFilter = (req, file, callback) => {
  if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
    return callback(new BadRequestException('Solo se permiten imágenes'), false);
  }
  callback(null, true);
};

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(
    private readonly usersService: UsersService,
    private readonly housesService: HousesService,
  ) {}

  @Post(':id/user')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: imageStorage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: imageFileFilter,
    }),
  )
  async uploadUserAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }
    return this.usersService.update(id, { avatar: file.filename } as any);
  }

  // Nueva: sube la foto de una casa. Se identifica por su "code" legible,
  // igual que el resto de operaciones sobre casas.
  @Post(':code/house')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: imageStorage,
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: imageFileFilter,
    }),
  )
  async uploadHouseImage(
    @Param('code') code: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }
    return this.housesService.update(code, { image: file.filename } as any);
  }
}

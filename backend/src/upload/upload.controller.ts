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
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { UsersService } from '../users/users.service';
import { HousesService } from '../houses/houses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: 'colombiatech2',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  }),
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
    // Con Cloudinary, file.path ya es la URL pública completa
    return this.usersService.update(id, { avatar: file.path } as any);
  }

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
    return this.housesService.update(code, { image: file.path } as any);
  }
}
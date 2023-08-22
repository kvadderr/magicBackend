import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('file')
export class FileController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadJSON(@UploadedFile() file: Express.Multer.File) {
    try {
      const arrayOfItems = JSON.parse(file.buffer.toString());
      for (let i = 0; i < arrayOfItems.length; i++) {
        await this.prisma.product.create({
          data: {
            image: arrayOfItems[i].image,
            name_ru: arrayOfItems[i].market_name,
            price: Math.round(arrayOfItems[i].priceByCurrency.RUB.safe),
            nameID: arrayOfItems[i].nameID,
            name_en: '',
          },
        });
      }
      return 'Products were created';
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

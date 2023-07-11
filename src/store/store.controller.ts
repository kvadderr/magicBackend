import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { BuyItemDto } from './dto/buyItem.dto';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post('/buy')
  @UseGuards(AuthGuard('jwt'))
  async buyItem(
    @Body() dto: BuyItemDto,
    @Headers('Authorization') authorization,
    @Res() res: Response,
  ) {
    try {
      const token = authorization.split(' ')[1];
      const data = await this.storeService.buyItem(
        token,
        dto.productId,
        dto.amount,
      );
      if (data.status == 'Success') {
        res.status(200).json(data);
      } else {
        res.status(400).json(data);
      }
    } catch (error) {
      throw error.message;
    }
  }

  @Get('/catalog/:id')
  getStore(@Param('id') id: number) {
    try {
      return this.storeService.getStoreByServerType(+id);
    } catch (error) {
      throw error.message;
    }
  }
}

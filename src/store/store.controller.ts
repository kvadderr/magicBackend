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
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  ProductDto,
  StantardResponseDto,
} from 'src/profile/dto/responseProfile.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Store')
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post('/buy')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Покупка предмета' })
  @ApiOkResponse({
    isArray: false,
    status: 200,
    type: StantardResponseDto,
  })
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
        dto.serverId,
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
  @ApiOkResponse({
    isArray: true,
    status: 200,
    type: ProductDto,
  })
  @ApiOperation({ summary: 'Каталог магазина в зависимости от типа сервера' })
  getStore(@Param('id') id: number) {
    try {
      return this.storeService.getStoreByServerType(+id);
    } catch (error) {
      throw error.message;
    }
  }

  @Post('/refill/:amount')
  refillMoney(
    @Headers('Authorization') authorization,
    @Param('amount') amount: string,
  ) {
    try {
      if (!authorization) {
        throw new Error('Insert your token');
      }
      const token = authorization.split(' ')[1];

      return this.storeService.refill(Number(amount), token);
    } catch (error) {
      throw error.message;
    }
  }

  @Get('/types')
  getTypes() {
    return this.storeService.getTypes();
  }

  @Get('/base')
  getBaseSettings() {
    return this.storeService.getBaseSettings();
  }
}

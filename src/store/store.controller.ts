import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
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
import { RolesGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/auth/guards/roles-guard.decorator';

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
    @Headers('Language') lang,
    @Res() res: Response,
  ) {
    try {
      const token = authorization.split(' ')[1];
      const data = await this.storeService.buyItem(
        token,
        dto.productId,
        dto.amount,
        dto.serverId,
        lang,
        dto.isPack,
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
  getStore(@Param('id') id: number, @Headers('Language') lang) {
    try {
      return this.storeService.getStoreByServerType(Number(id), lang);
    } catch (error) {
      throw error.message;
    }
  }

  @Post('/refill/?')
  async refillMoney(
    @Headers('Authorization') authorization,
    @Headers('Language') lang,
    @Query('amount') amount: string,
    @Query('type') type: string,

    @Res() res: Response,
  ) {
    try {
      if (!authorization) {
        throw new Error('Insert your token');
      }
      const token = authorization.split(' ')[1];

      const data = await this.storeService.refill(
        Number(amount),
        token,
        lang,
        type,
      );
      if (data.status == 'Success' && data.data.state == 'success') {
        res.status(200).json(data);
      } else {
        res.status(400).json(data);
      }
    } catch (error) {
      throw error.message;
    }
  }

  /*   @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Возврат средств' })
  @Roles('ADMINISTRATOR')
  @Post('/refund/:id')
  async refundMoney(@Param('id') id: string, @Res() res: Response) {
    try {
      const data = await this.storeService.refundTransaction(Number(id));
      if (data.status == 'Success') {
        res.status(200).json(data);
      } else {
        res.status(400).json(data);
      }
    } catch (error) {
      throw error.message;
    }
  } */

  @Get('/types')
  getTypes() {
    return this.storeService.getTypes();
  }

  @Get('/base')
  getBaseSettings(@Headers('Language') lang) {
    return this.storeService.getBaseSettings(lang);
  }

  @Get('/price/?')
  getCurrentPrice(
    @Query('id') productId: string,
    @Query('amount') amount: string,
  ) {
    return this.storeService.getCurrentPrice(Number(productId), Number(amount));
  }

  @Get('/currency/?')
  getPriceForCurrency(
    @Query('id') productId: string,
    @Query('amount') amount: string,
    @Query('rubs') rubs: string,
    @Query('isPack') isPack: string,
  ) {
    let flag = false;
    isPack == 'false' ? (flag = false) : (flag = true);

    return this.storeService.getPriceForCurrency(
      Number(productId),
      flag,
      Number(amount),
      Number(rubs),
    );
  }

  @Get('/getPriceForRefill/?')
  getPriceForRefill(
    @Headers('Language') lang,
    @Query('amount') amount: string,
    @Query('type') type: string,
  ) {
    return this.storeService.getPriceForRefill(Number(amount), lang, type);
  }
}

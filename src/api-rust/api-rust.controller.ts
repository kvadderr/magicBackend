import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiRustService } from './api-rust.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseApiDto } from './dto/response.dto';
import { Response } from 'express';

@Controller('api-rust')
@ApiTags('api-rust')
export class ApiRustController {
  constructor(private readonly apiService: ApiRustService) {}

  @Get('/products.get?')
  @ApiOperation({
    summary: 'Получения списка товаров, доступных на этом сервере',
  })
  @ApiOkResponse({
    isArray: false,
    status: 200,
    type: ResponseApiDto,
  })
  async getProducts(
    @Res() res: Response,
    @Query('server') serverID: string,
    @Query('token') token: string,
  ) {
    const data = await this.apiService.getProducts(Number(serverID), token);
    if (data.status == 'Success') {
      res.status(200).json(data);
    } else {
      res.status(400).json(data);
    }
  }

  @Get('/product.give?')
  @ApiOperation({
    summary:
      'Выдача товара в инвентарь пользователя. В истории покупок добавлять как бесплатную покупку.',
  })
  @ApiOkResponse({
    isArray: false,
    status: 200,
    type: ResponseApiDto,
  })
  async productGive(
    @Query('product') productId: string,
    @Query('token') token: string,
    @Query('steamid') steamId: string,
    @Query('quanity') quanity: number,
  ) {
    const data = await this.apiService.productGive(
      token,
      steamId,
      productId,
      Number(quanity),
    );
    return data;
  }

  @Get('/queue.auto?')
  @ApiOperation({
    summary:
      'Получение списка товаров, у которых указана автоактивация на этом сервере',
  })
  @ApiOkResponse({
    isArray: false,
    status: 200,
    type: ResponseApiDto,
  })
  async getQueueAuto(
    @Res() res: Response,
    @Query('server') serverID: string,
    @Query('token') token: string,
  ) {
    const data = await this.apiService.getQueueAuto(Number(serverID), token);
    if (data.status == 'Success') {
      res.status(200).json(data);
    } else {
      res.status(400).json(data);
    }
  }

  @Get('/queue.get?')
  @ApiOperation({
    summary: 'Получение списка товаров пользователя, доступные на этом сервере',
  })
  @ApiOkResponse({
    isArray: false,
    status: 200,
    type: ResponseApiDto,
  })
  async queueGet(
    @Res() res: Response,
    @Query('server') serverID: string,
    @Query('token') token: string,
    @Query('steamid') steamId: string,
  ) {
    const data = await this.apiService.queueGet(
      Number(serverID),
      token,
      steamId,
    );
    if (data.status == 'Success') {
      res.status(200).json(data);
    } else {
      res.status(400).json(data);
    }
  }

  @Get('/queue.give?')
  @ApiOperation({ summary: 'Отметить товар выданным' })
  @ApiOkResponse({
    isArray: false,
    status: 200,
    type: ResponseApiDto,
  })
  async queueGive(
    @Query('server') serverID: string,
    @Query('token') token: string,
    @Query('steamid') steamId: string,
    @Query('queueid') queueId: string,
  ) {
    const data = await this.apiService.queueGive(
      Number(serverID),
      token,
      steamId,
      Number(queueId),
    );
    return data;
  }

  @Get('/users.get?')
  @ApiOperation({ summary: 'Получение данных пользователя' })
  @ApiOkResponse({
    isArray: false,
    status: 200,
    type: ResponseApiDto,
  })
  async userGet(
    @Res() res: Response,
    @Query('token') token: string,
    @Query('steamid') steamId: string,
  ) {
    const data = await this.apiService.userGet(token, steamId);
    if (data.status == 'Success') {
      res.status(200).json(data);
    } else {
      res.status(400).json(data);
    }
  }

  @Get('/users.addBonus?')
  @ApiOperation({
    summary: 'Добавление пользователю бонусного баланса.',
  })
  @ApiOkResponse({
    status: 200,
  })
  userAddBonus(
    @Query('server') server: string,
    @Query('token') token: string,
    @Query('steamid') steamId: string,
    @Query('sum') sum: number,
  ) {
    return this.apiService.userAddBonus(
      Number(server),
      token,
      steamId,
      Number(sum),
    );
  }
}

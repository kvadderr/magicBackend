import { Controller, Get, Query } from '@nestjs/common';
import { ApiRustService } from './api-rust.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseApiDto } from './dto/response.dto';

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
  getProducts(
    @Query('server') serverID: string,
    @Query('token') token: string,
  ) {
    return this.apiService.getProducts(Number(serverID), token);
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
  getQueueAuto(
    @Query('server') serverID: string,
    @Query('token') token: string,
  ) {
    return this.apiService.getQueueAuto(Number(serverID), token);
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
  queueGet(
    @Query('server') serverID: string,
    @Query('token') token: string,
    @Query('steamid') steamId: string,
  ) {
    return this.apiService.queueGet(Number(serverID), token, steamId);
  }

  @Get('/queue.give?')
  @ApiOperation({ summary: 'Отметить товар выданным' })
  @ApiOkResponse({
    isArray: false,
    status: 200,
    type: ResponseApiDto,
  })
  queueGive(
    @Query('server') serverID: string,
    @Query('token') token: string,
    @Query('steamid') steamId: string,
    @Query('queueid') queueId: string,
  ) {
    return this.apiService.queueGive(
      Number(serverID),
      token,
      steamId,
      Number(queueId),
    );
  }

  @Get('/users.get?')
  @ApiOperation({ summary: 'Получение данных пользователя' })
  @ApiOkResponse({
    isArray: false,
    status: 200,
    type: ResponseApiDto,
  })
  userGet(@Query('token') token: string, @Query('steamid') steamId: string) {
    return this.apiService.userGet(token, steamId);
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
  productGive(
    @Query('product') productId: string,
    @Query('token') token: string,
    @Query('steamid') steamId: string,
    @Query('quanity ') quanity: string,
  ) {
    return this.apiService.productGive(
      token,
      steamId,
      productId,
      Number(quanity),
    );
  }
}

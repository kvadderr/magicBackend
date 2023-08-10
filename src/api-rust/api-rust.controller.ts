import { Controller, Get, Query } from '@nestjs/common';
import { ApiRustService } from './api-rust.service';

@Controller('api-rust')
export class ApiRustController {
  constructor(private readonly apiService: ApiRustService) {}

  @Get('/products.get?')
  getProducts(
    @Query('server') serverID: string,
    @Query('token') token: string,
  ) {
    return this.apiService.getProducts(Number(serverID), token);
  }

  @Get('/queue.auto?')
  getQueueAuto(
    @Query('server') serverID: string,
    @Query('token') token: string,
  ) {
    return this.apiService.getQueueAuto(Number(serverID), token);
  }

  @Get('/queue.get?')
  queueGet(
    @Query('server') serverID: string,
    @Query('token') token: string,
    @Query('steamid') steamId: string,
  ) {
    return this.apiService.queueGet(Number(serverID), token, steamId);
  }

  @Get('/queue.give?')
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
  userGet(@Query('token') token: string, @Query('steamid') steamId: string) {
    return this.apiService.userGet(token, steamId);
  }

  @Get('/product.give?')
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

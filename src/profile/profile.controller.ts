import { Controller, Get, Headers, Query } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('/inventory')
  getInventory(@Headers('Authorization') authorization) {
    const token = authorization.split(' ')[1];
    return this.profileService.getInventory(token);
  }

  @Get('/details/?')
  getDetails(
    @Headers('Authorization') authorization,
    @Query('page') pageNumber: number,
    @Query('select') selectNumber: number,
  ) {
    const token = authorization.split(' ')[1];
    return this.profileService.getDetalization(token, pageNumber, selectNumber);
  }

  @Get('/balance')
  getBalance(
    @Headers('Authorization') authorization,
    @Query('page') pageNumber: number,
    @Query('select') selectNumber: number,
  ) {
    const token = authorization.split(' ')[1];
    return this.profileService.getBalance(token);
  }
}

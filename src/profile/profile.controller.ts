import { Controller, Get, Headers, Query, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('/inventory')
  @UseGuards(AuthGuard('jwt'))
  getInventory(@Headers('Authorization') authorization) {
    try {
      const token = authorization.split(' ')[1];
      return this.profileService.getInventory(token);
    } catch (error) {
      throw error;
    }
  }

  @Get('/details/?')
  @UseGuards(AuthGuard('jwt'))
  getDetails(
    @Headers('Authorization') authorization,
    @Query('page') pageNumber: number,
    @Query('select') selectNumber: number,
  ) {
    try {
      const token = authorization.split(' ')[1];
      return this.profileService.getDetalization(
        token,
        pageNumber,
        selectNumber,
      );
    } catch (error) {
      throw error;
    }
  }

  @Get('/balance')
  @UseGuards(AuthGuard('jwt'))
  getBalance(
    @Headers('Authorization') authorization,
    @Query('page') pageNumber: number,
    @Query('select') selectNumber: number,
  ) {
    try {
      const token = authorization.split(' ')[1];
      return this.profileService.getBalance(token);
    } catch (error) {
      throw error;
    }
  }
}

import {
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

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

  @Put('/refund/:id')
  @UseGuards(AuthGuard('jwt'))
  async refundItem(
    @Headers('Authorization') authorization,
    @Param('id') id: number,
    @Res() res: Response,
  ) {
    const token = authorization.split(' ')[1];
    const data = await this.profileService.undoPurchase(token, +id);
    if (data.status == 'Success') {
      res.status(200).json(data);
    } else {
      res.status(400).json(data);
    }
  }
}

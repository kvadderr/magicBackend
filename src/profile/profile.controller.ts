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
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { Inventory } from '@prisma/client';
import {
  InventoryResponseDto,
  StantardResponseDto,
} from './dto/responseProfile.dto';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('/inventory')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Инвентарь пользователя' })
  @ApiOkResponse({
    isArray: false,
    status: 200,
    type: InventoryResponseDto,
  })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение информации по транзакциям' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение баланса' })
  getBalance(@Headers('Authorization') authorization) {
    try {
      const token = authorization.split(' ')[1];
      return this.profileService.getBalance(token);
    } catch (error) {
      throw error;
    }
  }

  @Put('/refund/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Возврат предмета' })
  @ApiOkResponse({
    isArray: false,
    status: 200,
    type: StantardResponseDto,
  })
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

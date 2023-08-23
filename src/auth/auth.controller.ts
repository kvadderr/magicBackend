import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Res,
  Param,
  HttpException,
  HttpStatus,
  Headers,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import {
  httpOnlyRequest,
  sameSiteRequest,
  secureRequst,
} from 'src/core/config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly httpService: HttpService,
  ) {}

  @Get('steam')
  @UseGuards(AuthGuard('steam'))
  async redirectToSteamAuth(): Promise<void> {}

  @Get('/refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const data = await this.authService.refresh(req.cookies.refreshToken, {
      clientIp: req.clientIp,
      browser: req.browser,
      deviceName: req.deviceName,
      deviceType: req.deviceType,
      os: req.os,
    });

    return res
      .cookie('refreshToken', data.refreshToken, {
        maxAge: 30 * 24 * 60 * 1000,
        secure: secureRequst,
        sameSite: sameSiteRequest,
        httpOnly: httpOnlyRequest,
      })
      .json({
        accessToken: data.accessToken,
        user: data.user,
      });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/logout')
  async logout(@Res() res: Response, @Req() req: Request) {
    const data = await this.authService.logout(req.cookies.refreshToken);

    return res
      .cookie('refreshToken', '', {
        maxAge: 30 * 24 * 60 * 1000,
        secure: secureRequst,
        sameSite: sameSiteRequest,
        httpOnly: httpOnlyRequest,
      })
      .json(data);
  }

  @Get('/openId/:id')
  async getUserData(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
    @Headers('signature') signature,
  ) {
    if (!id) {
      throw new HttpException('id is not provided', HttpStatus.BAD_REQUEST);
    }
    //TODO: найти ошибку в валидации
    if (signature) {
      const verifySignature = this.authService.verifySignature(signature);
    }

    const data = await this.authService.signUpIn(id, {
      clientIp: req.clientIp,
      browser: req.browser,
      deviceName: req.deviceName,
      deviceType: req.deviceType,
      os: req.os,
    });

    return res
      .cookie('refreshToken', data.refreshToken, {
        maxAge: 30 * 24 * 60 * 1000,
        secure: secureRequst,
        sameSite: sameSiteRequest,
        httpOnly: httpOnlyRequest,
      })
      .json(data);
  }

  @Get('/validateAdmin')
  validateAdmin(@Headers('Authorization') authorization) {
    const token = authorization.split(' ')[1];
    return this.authService.validateAdmin(token);
  }
}

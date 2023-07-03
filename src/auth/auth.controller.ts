import {
    Body,
    Controller,
    Post,
    Get,
    UseGuards,
    Req,
    Res
} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {ApiBearerAuth, ApiSecurity, ApiTags} from "@nestjs/swagger";
import { HttpService } from '@nestjs/axios';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express'



@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly httpService: HttpService
        ) {}

  @Get('steam')
  @UseGuards(AuthGuard('steam'))
  async redirectToSteamAuth(): Promise<void> {}

  @Get('steam/return')
  @UseGuards(AuthGuard('steam'))
  async handleSteamAuthCallback(@Req() req, @Res() res: Response): Promise<any> { 
    const data = await this.authService.signUpIn(req.user.steamId)  
    console.log(data);
     
    return res
    .cookie('refreshToken', data.refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 1000,
      sameSite: 'lax',
    })
    .json({
      accessToken: data.accessToken,
      user: data.user,
    });
  }

  @Get('/refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const data = await this.authService.refresh(req.cookies.refreshToken)

    return res
      .cookie('refreshToken', data.refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 1000,
        sameSite: 'lax',
      })
      .json({
        accessToken: data.accessToken,
        user: data.user,
      })
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/logout')
  async logout(@Res() res: Response, @Req() req: Request) {
    const data = await this.authService.logout(req.cookies.refreshToken)

    return res
      .cookie('refreshToken', '', {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 1000,
        sameSite: 'lax',
      })
      .json(data)
  }

}
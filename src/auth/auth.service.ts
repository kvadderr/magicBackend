import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { HttpService } from '@nestjs/axios';
import { TokenService } from 'src/token/token.service';
import { ResponseUserDto } from './dto/responseUser.dto';
import { JwtPayload } from './dto/jwtPayload.dto';
import { UserAgentDto } from './dto/userAgent.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly tokenService: TokenService,
    private readonly httpService: HttpService,
  ) {}

  async validateSteamAccount(identifier: string): Promise<any> {
    // Здесь вы должны реализовать логику проверки и сохранения пользователя
    // на основе полученных данных от Steam
    // Например, вы можете сохранить идентификатор Steam в базу данных
    // и возвращать соответствующего пользователя
    return {
      steamId: identifier,
      // Другие данные пользователя
    };
  }

  async validateUser(payload: JwtPayload): Promise<any> {
    const user = await this.userService.findById(payload.id);
    if (!user) {
      throw new HttpException('INVALID_TOKEN', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  async signUpIn(id: string, userAgent: UserAgentDto) {
    try {
      const candidate = await this.userService.findBySteamId(id);

      if (!candidate) {
        const user = await this.userService.create(id);
        const tokens = this.tokenService.generateTokens({
          id: user.id,
          steamId: user.steamID,
          role: user.role,
          avatar: user.steamAvatar,
          name: user.steamName,
        });

        await this.tokenService.saveToken({
          userId: user.id,
          token: tokens.refreshToken,
          userAgent: {
            browser: userAgent.browser,
            clientIp: userAgent.clientIp,
            deviceName: userAgent.deviceName,
            deviceType: userAgent.deviceType,
            os: userAgent.os,
          },
        });

        return {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: new ResponseUserDto(user),
        };
      } else {
        const tokens = this.tokenService.generateTokens({
          id: candidate.id,
          steamId: candidate.steamID,
          role: candidate.role,
          avatar: candidate.steamAvatar,
          name: candidate.steamName,
        });

        await this.tokenService.saveToken({
          userId: candidate.id,
          token: tokens.refreshToken,
          userAgent: {
            browser: userAgent.browser,
            clientIp: userAgent.clientIp,
            deviceName: userAgent.deviceName,
            deviceType: userAgent.deviceType,
            os: userAgent.os,
          },
        });

        return {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: new ResponseUserDto(candidate),
        };
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
    //* ExampleL {"steamId":"https://steamcommunity.com/openid/id/76561198075427441"}
  }

  async refresh(token: string, userAgent: UserAgentDto) {
    const userData = await this.tokenService.validateRefreshToken(
      token,
      userAgent,
    );

    if (!userData) {
      throw new HttpException(
        'Пользователь не авторизован',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.userService.findById(userData.id);

    const tokens = this.tokenService.generateTokens({
      id: user.id,
      steamId: user.steamID,
      role: user.role,
      avatar: user.steamAvatar,
      name: user.steamName,
    });

    await this.tokenService.saveToken({
      userId: user.id,
      token: tokens.refreshToken,
      userAgent,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: new ResponseUserDto(user),
    };
  }

  async logout(refreshToken: string) {
    const token = await this.tokenService.deleteToken(refreshToken);
    if (token) {
      return { message: 'Вы успешно разлогинены' };
    } else {
      throw new HttpException('Токен не существует', HttpStatus.BAD_REQUEST);
    }
  }

  async getByOpenId(id: string, userAgent: UserAgentDto) {
    const candidate = await this.userService.findBySteamId(id);

    const tokens = this.tokenService.generateTokens({
      id: candidate.id,
      steamId: candidate.steamID,
      role: candidate.role,
      avatar: candidate.steamAvatar,
      name: candidate.steamName,
    });

    await this.tokenService.saveToken({
      userId: candidate.id,
      token: tokens.refreshToken,
      userAgent: {
        browser: userAgent.browser,
        clientIp: userAgent.clientIp,
        deviceName: userAgent.deviceName,
        deviceType: userAgent.deviceType,
        os: userAgent.os,
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: new ResponseUserDto(candidate),
    };
  }

  async validateAdmin(token: string) {
    const data = this.tokenService.validateAdmin(token);
    if (!data) {
      throw new HttpException('JWT expired', HttpStatus.BAD_REQUEST);
    }
    return data.role == 'ADMINISTRATOR' ? true : false;
  }
}

export interface RegistrationStatus {
  success: boolean;
  message: string;
  data?: User;
}
export interface RegistrationSeederStatus {
  success: boolean;
  message: string;
  data?: User[];
}

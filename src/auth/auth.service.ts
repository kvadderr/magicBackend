import * as crypto from 'crypto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { HttpService } from '@nestjs/axios';
import { TokenService } from 'src/token/token.service';
import { ResponseUserDto } from './dto/responseUser.dto';
import { JwtPayload } from './dto/jwtPayload.dto';
import { UserAgentDto } from './dto/userAgent.dto';
import { SECRET_KEY } from 'src/core/config';
import { ParsedUrlQuery } from 'querystring';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

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

  async verifySignature(searchOrParsedUrlQuery: string | ParsedUrlQuery) {
    let sign: string | undefined;
    const queryParams: IQueryParam[] = [];

    /**
     * Функция, которая обрабатывает входящий query-параметр. В случае передачи
     * параметра, отвечающего за подпись, подменяет "sign". В случае встречи
     * корректного в контексте подписи параметра добавляет его в массив
     * известных параметров.
     * @param key
     * @param value
     */
    const processQueryParam = (key: string, value: any) => {
      if (typeof value === 'string') {
        if (key.startsWith('openid.')) {
          queryParams.push({ key, value });
        }
      }
    };

    if (typeof searchOrParsedUrlQuery === 'string') {
      // Если строка начинается с вопроса (когда передан window.location.search),
      // его необходимо удалить.
      const formattedSearch = searchOrParsedUrlQuery.startsWith('?')
        ? searchOrParsedUrlQuery.slice(1)
        : searchOrParsedUrlQuery;

      // Пытаемся спарсить строку как query-параметр.
      for (const param of formattedSearch.split('&')) {
        const [key, value] = param.split('=');
        processQueryParam(key, value);
      }
    } else {
      for (const key of Object.keys(searchOrParsedUrlQuery)) {
        const value = searchOrParsedUrlQuery[key];
        processQueryParam(key, value);
      }
    }

    const index = Array.prototype.findIndex.call(
      queryParams,
      (x) => x.key == 'openid.mode',
    );
    queryParams[index].value = 'check_authentication';

    if (!sign || queryParams.length === 0) {
      return false;
    }

    const queryString = queryParams.reduce<string>(
      (acc, { key, value }, idx) => {
        return (
          acc + (idx === 0 ? '' : '&') + `${key}=${decodeURIComponent(value)}`
        );
      },
      '',
    );

    console.log(`https://steamcommunity.com/openid/login?${queryString}`);

    const userSteamData = await firstValueFrom(
      this.httpService
        .get(`https://steamcommunity.com/openid/login?${queryString}`)
        .pipe(
          catchError((error: AxiosError) => {
            console.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );

    console.log(userSteamData.data);

    // Создаём хеш получившейся строки на основе секретного ключа.
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
export interface IQueryParam {
  key: string;
  value: string;
}

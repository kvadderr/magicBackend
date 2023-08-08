import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenService } from 'src/token/token.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class NotificationService {
  constructor(
    private httpService: HttpService,
    private prisma: PrismaService,
    private tokenService: TokenService,
    private userService: UsersService,
  ) {}

  async generateCode(token: string) {
    try {
      const isUser = await this.tokenService.validateAccessToken(token);

      const user = await this.userService.findBySteamId(isUser.steamId);

      if (!user) {
        throw new HttpException(
          'Пользователь не найден',
          HttpStatus.BAD_REQUEST,
        );
      }

      const settings = await this.prisma.baseSettings.findFirst({
        select: {
          apiKey: true,
        },
      });

      const newCode = this.httpService
        .get(
          `https://vk.magicrust.ru/api/getTestAlertCode?apiKey=${settings.apiKey}&steamid=${user.steamID}`,
        )
        .pipe(map((resp) => resp.data));

      return newCode;
    } catch (error) {
      console.log(error);

      return {
        status: 'Error',
        message: error.message,
      };
    }
  }
}

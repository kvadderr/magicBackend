import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(
    private httpService: HttpService,
    private prisma: PrismaService,
  ) {}

  async generateCode(steamId: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          steamID: steamId,
        },
      });

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
          `https://vk.magicrust.ru/api/getTestAlertCode?apiKey=${settings.apiKey}&steamid=${steamId}`,
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

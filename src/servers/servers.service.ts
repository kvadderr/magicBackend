import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ServersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}
  //*API мониторинг: https://vk.magicrust.ru/api/getOnline
  //*API leaderboard: https://stat.magic-rust.ru/api/getPublicData.php?server=1
  async getServerStat() {
    const serverData = await firstValueFrom(
      this.httpService.get(`https://vk.magicrust.ru/api/getOnline`).pipe(
        catchError((error: AxiosError) => {
          console.error(error.response.data);
          throw 'An error happened!';
        }),
      ),
    );

    console.log(serverData);
  }
}

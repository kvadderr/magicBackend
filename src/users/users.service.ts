import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { compare, hash } from 'bcrypt';

import {
  CreateUserDto,
  LoginUserDto,
  UpdatePasswordDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { firstValueFrom, catchError } from 'rxjs';
import { STEAM_API_KEY } from 'src/core/config';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async create(id: string) {
    try {
      const userSteamData = await firstValueFrom(
        this.httpService
          .get(
            `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${id}`,
          )
          .pipe(
            catchError((error: AxiosError) => {
              console.error(error.response.data);
              throw 'An error happened!';
            }),
          ),
      );

      console.log(userSteamData.data.response.players[0]);
      const mainData = userSteamData.data.response.players[0];

      const config = await this.prisma.baseSettings.findFirst();

      const newUser = await this.prisma.user.create({
        data: {
          steamName: mainData.personaname,
          steamID: mainData.steamid,
          steamAvatar: mainData.avatarfull,
          mainBalance: config.startBalance,
        },
      });

      return newUser;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.prisma.user.findMany();
    } catch (error) {
      console.error(error.message);
      return error;
    }
  }

  async findBySteamId(id: string) {
    try {
      const candidate = await this.prisma.user.findFirst({
        where: {
          steamID: id,
        },
      });

      return candidate;
    } catch (error) {
      console.error(error.message);
      return error;
    }
  }

  async findById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) {
        throw new HttpException(
          'User with provided id does not exist.',
          HttpStatus.BAD_REQUEST,
        );
      }

      return user;
    } catch (error) {
      console.error(error.message);
      return error;
    }
  }
}

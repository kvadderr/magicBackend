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
import { TokenService } from 'src/token/token.service';
import { User } from '@prisma/client';
import { ResponseUserDto } from 'src/auth/dto/responseUser.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly tokenService: TokenService,
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

      const mainData = userSteamData.data.response.players[0];

      const config = await this.prisma.baseSettings.findFirst();

      const newUser = await this.prisma.user.create({
        data: {
          steamName: mainData.personaname,
          steamID: mainData.steamid,
          steamAvatar: mainData.avatarfull,
          mainBalance: 0,
          bonusBalance: config.startBalance,
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
      throw error;
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
      throw error;
    }
  }

  async whoAmI(token: string) {
    try {
      const tokenData = await this.tokenService.validateAccessToken(token);

      const user = await this.findById(tokenData.id);

      const userSteamData = await firstValueFrom(
        this.httpService
          .get(
            `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${user.steamID}`,
          )
          .pipe(
            catchError((error: AxiosError) => {
              console.error(error.response.data);
              throw 'An error happened!';
            }),
          ),
      );

      const mainData = userSteamData.data.response.players[0];

      const updUser = await this.prisma.user.update({
        where: {
          steamID: user.steamID,
        },
        data: {
          steamAvatar: mainData.avatarfull,
          steamName: mainData.personaname,
        },
      });
      return new ResponseUserDto(updUser);
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  async findById(id: number): Promise<User> {
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
      throw error;
    }
  }
}

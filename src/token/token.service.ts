import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'src/auth/dto/jwtPayload.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SaveTokenDto } from './dto/saveToken.dto';
import { SECRET_KEY } from 'src/core/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  generateTokens(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, {
      privateKey: SECRET_KEY,
      expiresIn: '15s',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: SECRET_KEY,
      expiresIn: '30d',
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async validateAccessToken(token: string) {
    try {
      const userData = this.jwtService.verify(token, {
        secret: SECRET_KEY,
      }) as JwtPayload;

      return userData;
    } catch (e) {
      console.log(e);

      return null;
    }
  }

  async validateRefreshToken(token: string) {
    try {
      const userData = this.jwtService.verify(token, {
        secret: SECRET_KEY,
      }) as JwtPayload;

      const currentToken = await this.prisma.token.findFirst({
        where: { token, userId: userData.id },
      });

      if (!currentToken) {
        throw new HttpException('Токен не найден', HttpStatus.UNAUTHORIZED);
      }

      return userData;
    } catch (e) {
      const currentToken = await this.prisma.token.findFirst({
        where: { token },
      });
      if (currentToken) {
        await this.prisma.token.delete({
          where: {
            id: currentToken.id,
          },
        });
      }
      return null;
    }
  }

  async saveToken(dto: SaveTokenDto) {
    const tokens = await this.prisma.token.findMany({
      where: { userId: dto.userId },
    });

    if (tokens.length === 10) {
      await this.prisma.token.deleteMany({
        where: {
          userId: dto.userId,
        },
      });
    }

    const candidateToken = await this.prisma.token.findFirst({
      where: {
        userId: dto.userId,
      },
    });

    if (candidateToken) {
      await this.prisma.token.delete({
        where: {
          id: candidateToken.id,
        },
      });
    }
    const token = await this.prisma.token.create({
      data: {
        userId: dto.userId,
        token: dto.token,
      },
    });

    return token;
  }

  async deleteToken(token: string) {
    const candidate = await this.prisma.token.findFirst({
      where: {
        token,
      },
    });
    const tokenData = await this.prisma.token.delete({
      where: {
        id: candidate.id,
      },
    });

    return tokenData;
  }

  async deleteAllTokens(userId: number) {
    const tokenData = await this.prisma.token.deleteMany({
      where: {
        userId,
      },
    });

    return tokenData;
  }

  async findToken(token: string) {
    const tokenData = await this.prisma.token.findFirst({
      where: {
        token,
      },
    });
    return tokenData;
  }

  async deleteDeadTokens(userId: number) {
    const tokens = await this.prisma.token.findMany({
      where: {
        userId,
      },
    });

    for (const token of tokens) {
      try {
        jwt.verify(token.token, process.env.JWT_REFTESH_SECRET);
      } catch (e) {
        await this.prisma.token.delete({
          where: {
            id: token.id,
          },
        });
      }
    }
  }

  parseJwt(token: string) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  }
}

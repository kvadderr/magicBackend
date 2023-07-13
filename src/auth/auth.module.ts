import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';
import { SteamStrategy } from './strategy/auth.steam.strategy';
import { TokenModule } from 'src/token/token.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { SECRET_KEY } from 'src/core/config';

@Module({
  imports: [
    HttpModule,
    UsersModule,
    TokenModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    PassportModule.register({ defaultStrategy: 'steam' }),
    JwtModule.register({
      secret: SECRET_KEY,
      signOptions: {
        expiresIn: process.env.EXPIRESIN,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    JwtStrategy,
    PrismaService,
    SteamStrategy,
  ],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}

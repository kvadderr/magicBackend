import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { SECRET_KEY } from 'src/core/config';

@Module({
  providers: [TokenService, PrismaService],
  exports: [TokenService],
  imports: [
    JwtModule.register({
      secret: SECRET_KEY,
    }),
  ],
})
export class TokenModule {}

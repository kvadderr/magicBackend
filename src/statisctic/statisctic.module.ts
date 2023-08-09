import { Module } from '@nestjs/common';
import { StatiscticController } from './statisctic.controller';
import { StatiscticService } from './statisctic.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenModule } from 'src/token/token.module';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { SECRET_KEY } from 'src/core/config';

@Module({
  controllers: [StatiscticController],
  providers: [StatiscticService, PrismaService],
  imports: [
    TokenModule,
    UsersModule,
    JwtModule.register({
      secret: SECRET_KEY,
      signOptions: {
        expiresIn: process.env.EXPIRESIN,
      },
    }),
  ],
})
export class StatiscticModule {}

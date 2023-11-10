import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersModule } from 'src/users/users.module';
import { TokenModule } from 'src/token/token.module';
import { HttpModule } from '@nestjs/axios';

import { JwtModule } from '@nestjs/jwt';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  controllers: [StoreController],
  providers: [StoreService, PrismaService],
  imports: [UsersModule, TokenModule, JwtModule, HttpModule, PaymentModule],
})
export class StoreModule {}

import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [PaymentService, PrismaService],
  imports: [HttpModule],
})
export class PaymentModule {}

import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [ContactsService, PrismaService],
  controllers: [ContactsController],
})
export class ContactsModule {}

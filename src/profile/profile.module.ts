import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenModule } from 'src/token/token.module';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, PrismaService],
  imports: [TokenModule, UsersModule, JwtModule],
})
export class ProfileModule {}

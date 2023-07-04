import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { TokenModule } from './token/token.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    PassportModule.register({ defaultStrategy: 'steam' }),
    TokenModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

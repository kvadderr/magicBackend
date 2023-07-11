import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { TokenModule } from './token/token.module';
import { ProfileModule } from './profile/profile.module';
import { FileModule } from './file/file.module';
import { StoreModule } from './store/store.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    PassportModule.register({ defaultStrategy: 'steam' }),
    TokenModule,
    ProfileModule,
    FileModule,
    StoreModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

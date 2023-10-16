import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { TokenModule } from './token/token.module';
import { ProfileModule } from './profile/profile.module';
import { FileModule } from './file/file.module';
import { StoreModule } from './store/store.module';
import { CustompageModule } from './custompage/custompage.module';
import { ServersModule } from './servers/servers.module';
import { UserAgentMiddleware } from './auth/middleware/req.middleware';
import { ApiRustModule } from './api-rust/api-rust.module';
import { NotificationModule } from './notification/notification.module';
import { StatiscticModule } from './statisctic/statisctic.module';
import { ContactsModule } from './contacts/contacts.module';
import { VisitorMiddleware } from './visitor-middleware/visitor.middleware';
import { LanguageMiddleware } from './store/middlewares/language.middleware';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentModule } from './payment/payment.module';

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
    CustompageModule,
    ServersModule,
    ApiRustModule,
    NotificationModule,
    StatiscticModule,
    ContactsModule,
    ScheduleModule.forRoot(),
    PaymentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserAgentMiddleware)
      .forRoutes('auth')
      .apply(VisitorMiddleware)
      .forRoutes('*')
      .apply(LanguageMiddleware)
      .forRoutes('*');
  }
}

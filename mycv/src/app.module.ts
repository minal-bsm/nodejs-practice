import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { User } from './users/user.entity';
import { Report } from './reports/report.entity';
const cookieSession = require('cookie-session');


@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'sqlite',
    database: 'db.sqlite',
    entities: [User, Report],
    synchronize: true
  }),
  UsersModule, ReportsModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      //setting up a global validation pipe
      provide: APP_PIPE, //whenever we create an instance of appModule, we will apply this validation pipe to all the requests
      useValue: new ValidationPipe({whitelist: true})
    }
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) { //set up middleware that will run on all incoming requests
    consumer.apply(cookieSession({keys: ['asdfasdf']})).forRoutes('*');
  }
}
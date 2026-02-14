import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('DB_URI'),
        onConnectionCreate(connection) {
          connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
          });
          connection.on('connected', () => {
            console.log('MongoDB connected successfully');
          });
          connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
          });
        },
      }),
    }),
    AuthModule,
    UsersModule,
    TasksModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

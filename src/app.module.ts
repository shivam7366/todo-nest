import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from './mail/mail.module';
import { RedisModule } from '@songkeys/nestjs-redis';

@Module({
  imports: [

    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory:  (config: ConfigService) => ({
        config:{host: config.get<string>('REDIS_HOST'),
        port: config.get<number>('REDIS_PORT'),
      },
      onClientReady() {
        console.log('Redis client ready');
      },
    }),
      
    }),
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

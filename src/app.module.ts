import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { SpellListsModule } from './modules/spell-lists/spell-lists.module';
import Joi from 'joi';
import { SharedModule } from './modules/shared/shared.module';
import { SpellsModule } from './modules/spells/spells.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        PORT: Joi.number().positive().default(3001),
        RMU_MONGO_SPELL_LIST_URI: Joi.string().required(),
        RMU_IAM_JWK_URI: Joi.string().uri().required(),
        RMU_IAM_TOKEN_URI: Joi.string().uri().required(),
        RMU_IAM_CLIENT_ID: Joi.string().required(),
        RMU_IAM_CLIENT_SECRET: Joi.string().required(),
        RMU_KAFKA_BROKERS: Joi.string().required(),
        RMU_KAFKA_CLIENT_ID: Joi.string().required(),
        RMU_KAFKA_DEFAULT_PARTITIONS: Joi.number().integer().min(1).default(1),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('RMU_MONGO_SPELL_LIST_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    SharedModule,
    SpellListsModule,
    SpellsModule,
  ],
})
export class AppModule {}

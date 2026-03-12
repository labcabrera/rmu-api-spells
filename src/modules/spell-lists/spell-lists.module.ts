import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TerminusModule } from '@nestjs/terminus';
import { AuthModule } from 'src/modules/auth/auth.module';
import { MongoRealmRepository } from './infrastructure/db/mongo.spell-list.repository';
import { RealmController } from './interfaces/http/spell-list.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RealmModel, RealmSchema } from './infrastructure/persistence/models/spell-list-model';
import { KafkaRealmProducerService } from './infrastructure/messaging/kafka.spell-list-bus.adapter';
import { CreateSpellListHandler } from './application/cqrs/handlers/create-spell-list.handler';
import { DeleteSpellListHandler } from './application/cqrs/handlers/delete-spell-list.handler';
import { GetSpellListHandler } from './application/cqrs/handlers/get-spell-list.handler';
import { GetRealmsHandler } from './application/cqrs/handlers/get-spell-lists.handler';
import { UpdateSpellListHandler } from './application/cqrs/handlers/update-realm.handler';
import { SharedModule } from '../shared/shared.module';
import { SpellListGuardAdapter } from './infrastructure/security/spell-list.guard.adapter';

@Module({
  imports: [
    TerminusModule,
    CqrsModule,
    MongooseModule.forFeature([{ name: RealmModel.name, schema: RealmSchema }]),
    AuthModule,
    SharedModule,
  ],
  controllers: [RealmController],
  providers: [
    GetSpellListHandler,
    GetRealmsHandler,
    CreateSpellListHandler,
    UpdateSpellListHandler,
    DeleteSpellListHandler,
    {
      provide: 'SpellListRepository',
      useClass: MongoRealmRepository,
    },
    {
      provide: 'SpellListEventProducer',
      useClass: KafkaRealmProducerService,
    },
    {
      provide: 'SpellListGuardPort',
      useClass: SpellListGuardAdapter,
    },
  ],
  exports: ['SpellListRepository'],
})
export class SpellListsModule {}

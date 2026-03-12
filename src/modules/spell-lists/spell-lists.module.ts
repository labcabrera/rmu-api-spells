import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TerminusModule } from '@nestjs/terminus';
import { AuthModule } from 'src/modules/auth/auth.module';
import { MongoSpellListRepository } from './infrastructure/db/mongo.spell-list.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { SpellListModel, SpellListSchema } from './infrastructure/persistence/models/spell-list-model';
import { KafkaSpellListProducerService } from './infrastructure/messaging/kafka.spell-list-bus.adapter';
import { CreateSpellListHandler } from './application/cqrs/handlers/create-spell-list.handler';
import { DeleteSpellListHandler } from './application/cqrs/handlers/delete-spell-list.handler';
import { GetSpellListHandler } from './application/cqrs/handlers/get-spell-list.handler';
import { UpdateSpellListHandler } from './application/cqrs/handlers/update-spell-list.handler';
import { SharedModule } from '../shared/shared.module';
import { SpellListGuardAdapter } from './infrastructure/security/spell-list.guard.adapter';
import { SpellListController } from './interfaces/http/spell-list.controller';
import { GetSpellListsHandler } from './application/cqrs/handlers/get-spell-lists.handler';

@Module({
  imports: [
    TerminusModule,
    CqrsModule,
    MongooseModule.forFeature([{ name: SpellListModel.name, schema: SpellListSchema }]),
    AuthModule,
    SharedModule,
  ],
  controllers: [SpellListController],
  providers: [
    GetSpellListHandler,
    GetSpellListsHandler,
    CreateSpellListHandler,
    UpdateSpellListHandler,
    DeleteSpellListHandler,
    {
      provide: 'SpellListRepository',
      useClass: MongoSpellListRepository,
    },
    {
      provide: 'SpellListEventProducer',
      useClass: KafkaSpellListProducerService,
    },
    {
      provide: 'SpellListGuardPort',
      useClass: SpellListGuardAdapter,
    },
  ],
  exports: ['SpellListRepository'],
})
export class SpellListsModule {}

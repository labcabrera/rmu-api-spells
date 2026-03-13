import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TerminusModule } from '@nestjs/terminus';
import { AuthModule } from 'src/modules/auth/auth.module';
import { MongoSpellRepository } from './infrastructure/db/mongo.spell.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { KafkaSpellListProducerService } from './infrastructure/messaging/kafka.spell-list-bus.adapter';
import { CreateSpellHandler } from './application/cqrs/handlers/create-spell.handler';
import { SharedModule } from '../shared/shared.module';
import { SpellGuardAdapter } from './infrastructure/security/spell.guard.adapter';
import { SpellController } from './interfaces/http/spell.controller';
import { GetSpellsHandler } from './application/cqrs/handlers/get-spells.handler';
import { SpellModel, SpellSchema } from './infrastructure/persistence/models/spell.model';
import { GetSpellHandler } from './application/cqrs/handlers/get-spell.handler';
import { UpdateSpellHandler } from './application/cqrs/handlers/update-spell.handler';
import { DeleteSpellHandler } from './application/cqrs/handlers/delete-spell.handler';
import { SpellTargetTypeController } from './interfaces/http/spell.controller copy';

@Module({
  imports: [
    TerminusModule,
    CqrsModule,
    MongooseModule.forFeature([{ name: SpellModel.name, schema: SpellSchema }]),
    AuthModule,
    SharedModule,
  ],
  controllers: [SpellController, SpellTargetTypeController],
  providers: [
    GetSpellHandler,
    GetSpellsHandler,
    CreateSpellHandler,
    UpdateSpellHandler,
    DeleteSpellHandler,
    {
      provide: 'SpellRepository',
      useClass: MongoSpellRepository,
    },
    {
      provide: 'SpellEventProducer',
      useClass: KafkaSpellListProducerService,
    },
    {
      provide: 'SpellGuardPort',
      useClass: SpellGuardAdapter,
    },
  ],
  exports: ['SpellRepository'],
})
export class SpellsModule {}

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TerminusModule } from '@nestjs/terminus';
import { AuthModule } from '../shared/infrastructure/security/auth.module.js';
import { MongoSpellRepository } from './infrastructure/db/mongo.spell.repository.js';
import { MongooseModule } from '@nestjs/mongoose';
import { CreateSpellHandler } from './application/cqrs/handlers/create-spell.handler.js';
import { SharedModule } from '../shared/shared.module.js';
import { SpellGuardAdapter } from './infrastructure/security/spell.guard.adapter.js';
import { SpellController } from './interfaces/http/spell.controller.js';
import { GetSpellsHandler } from './application/cqrs/handlers/get-spells.handler.js';
import { SpellModel, SpellSchema } from './infrastructure/persistence/models/spell.model.js';
import { GetSpellHandler } from './application/cqrs/handlers/get-spell.handler.js';
import { UpdateSpellHandler } from './application/cqrs/handlers/update-spell.handler.js';
import { DeleteSpellHandler } from './application/cqrs/handlers/delete-spell.handler.js';
import { SpellTargetTypeController } from './interfaces/http/spell-target-type.controller.js';
import { SPELL_GUARD_PORT } from './application/ports/spell-guard.port.js';
import { SpellListsModule } from '../spell-lists/spell-lists.module.js';
import { SPELL_REPOSITORY } from './application/ports/spell-repository.port.js';

@Module({
  imports: [
    TerminusModule,
    CqrsModule,
    MongooseModule.forFeature([{ name: SpellModel.name, schema: SpellSchema }]),
    AuthModule,
    SharedModule,
    SpellListsModule,
  ],
  controllers: [SpellController, SpellTargetTypeController],
  providers: [
    GetSpellHandler,
    GetSpellsHandler,
    CreateSpellHandler,
    UpdateSpellHandler,
    DeleteSpellHandler,
    {
      provide: SPELL_REPOSITORY,
      useClass: MongoSpellRepository,
    },
    {
      provide: SPELL_GUARD_PORT,
      useClass: SpellGuardAdapter,
    },
  ],
  exports: [SPELL_REPOSITORY],
})
export class SpellsModule {}

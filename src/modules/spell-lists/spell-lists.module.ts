import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TerminusModule } from '@nestjs/terminus';
import { AuthModule } from '../shared/infrastructure/security/auth.module.js';
import { MongoSpellListRepository } from './infrastructure/db/mongo.spell-list.repository.js';
import { MongooseModule } from '@nestjs/mongoose';
import { SpellListModel, SpellListSchema } from './infrastructure/persistence/models/spell-list.model.js';
import { CreateSpellListHandler } from './application/cqrs/handlers/create-spell-list.handler.js';
import { DeleteSpellListHandler } from './application/cqrs/handlers/delete-spell-list.handler.js';
import { GetSpellListHandler } from './application/cqrs/handlers/get-spell-list.handler.js';
import { UpdateSpellListHandler } from './application/cqrs/handlers/update-spell-list.handler.js';
import { SharedModule } from '../shared/shared.module.js';
import { SpellListGuardAdapter } from './infrastructure/security/spell-list.guard.adapter.js';
import { SpellListController } from './interfaces/http/spell-list.controller.js';
import { GetSpellListsHandler } from './application/cqrs/handlers/get-spell-lists.handler.js';
import { SPELL_LIST_GUARD_PORT } from './application/ports/spell-list-guard.port.js';
import { SPELL_LIST_CONTENTS_PORT } from './application/ports/spell-list-contents.port.js';
import { MongoSpellListContentsAdapter } from './infrastructure/db/mongo.spell-list-contents.adapter.js';
import { SPELL_LIST_REPOSITORY } from './application/ports/spell-list-repository.port.js';

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
      provide: SPELL_LIST_REPOSITORY,
      useClass: MongoSpellListRepository,
    },
    {
      provide: SPELL_LIST_CONTENTS_PORT,
      useClass: MongoSpellListContentsAdapter,
    },
    {
      provide: SPELL_LIST_GUARD_PORT,
      useClass: SpellListGuardAdapter,
    },
  ],
  exports: [SPELL_LIST_REPOSITORY, SPELL_LIST_GUARD_PORT],
})
export class SpellListsModule {}

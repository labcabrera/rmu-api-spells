import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TerminusModule } from '@nestjs/terminus';
import { AuthModule } from '../shared/infrastructure/security/auth.module';
import { MongoSpellListRepository } from './infrastructure/db/mongo.spell-list.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { SpellListModel, SpellListSchema } from './infrastructure/persistence/models/spell-list.model';
import { CreateSpellListHandler } from './application/cqrs/handlers/create-spell-list.handler';
import { DeleteSpellListHandler } from './application/cqrs/handlers/delete-spell-list.handler';
import { GetSpellListHandler } from './application/cqrs/handlers/get-spell-list.handler';
import { UpdateSpellListHandler } from './application/cqrs/handlers/update-spell-list.handler';
import { SharedModule } from '../shared/shared.module';
import { SpellListGuardAdapter } from './infrastructure/security/spell-list.guard.adapter';
import { SpellListController } from './interfaces/http/spell-list.controller';
import { GetSpellListsHandler } from './application/cqrs/handlers/get-spell-lists.handler';
import { SPELL_LIST_GUARD_PORT } from './application/ports/spell-list-guard.port';
import { SPELL_LIST_REPOSITORY } from './application/ports/spell-list-repository.port';

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
      provide: SPELL_LIST_GUARD_PORT,
      useClass: SpellListGuardAdapter,
    },
  ],
  exports: [SPELL_LIST_REPOSITORY],
})
export class SpellListsModule {}

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TerminusModule } from '@nestjs/terminus';
import { AuthModule } from '../shared/infrastructure/security/auth.module';
import { MongoSpellRepository } from './infrastructure/db/mongo.spell.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { CreateSpellHandler } from './application/cqrs/handlers/create-spell.handler';
import { SharedModule } from '../shared/shared.module';
import { SpellGuardAdapter } from './infrastructure/security/spell.guard.adapter';
import { SpellController } from './interfaces/http/spell.controller';
import { GetSpellsHandler } from './application/cqrs/handlers/get-spells.handler';
import { SpellModel, SpellSchema } from './infrastructure/persistence/models/spell.model';
import { GetSpellHandler } from './application/cqrs/handlers/get-spell.handler';
import { UpdateSpellHandler } from './application/cqrs/handlers/update-spell.handler';
import { DeleteSpellHandler } from './application/cqrs/handlers/delete-spell.handler';
import { SpellTargetTypeController } from './interfaces/http/spell-target-type.controller';
import { SPELL_GUARD_PORT } from './application/ports/spell-guard.port';
import { SPELL_REPOSITORY } from './application/ports/spell-repository.port';

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

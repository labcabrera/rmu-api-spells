import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { type SpellListRepository, SPELL_LIST_REPOSITORY } from '../../../../spell-lists/application/ports/spell-list-repository.port.js';
import { Inject } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/domain/errors/errors.js';
import { Spell } from '../../../domain/aggregates/spell.js';
import { type SpellRepository, SPELL_REPOSITORY } from '../../ports/spell-repository.port.js';
import { GetSpellQuery } from '../queries/get-spell.query.js';
import { type SpellGuardPort, SPELL_GUARD_PORT } from '../../ports/spell-guard.port.js';

@QueryHandler(GetSpellQuery)
export class GetSpellHandler implements IQueryHandler<GetSpellQuery, Spell> {
  constructor(
    @Inject(SPELL_REPOSITORY) private readonly spellRepository: SpellRepository,
    @Inject(SPELL_LIST_REPOSITORY) private readonly spellListRepository: SpellListRepository,
    @Inject(SPELL_GUARD_PORT) private readonly spellGuard: SpellGuardPort,
  ) {}

  async execute(query: GetSpellQuery): Promise<Spell> {
    const data = await this.spellRepository.findById(query.id);
    if (!data) throw new NotFoundError('Spell', query.id);
    const list = await this.spellListRepository.findById(data.spellListId);
    this.spellGuard.checkRead(data, list, query.userId, query.roles);
    return data;
  }
}

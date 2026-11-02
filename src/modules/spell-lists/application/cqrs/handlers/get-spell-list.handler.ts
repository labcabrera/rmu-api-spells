import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetSpellListQuery } from '../queries/get-spell-list.query.js';
import { NotFoundError } from '../../../../shared/domain/errors/errors.js';
import { SpellList } from '../../../domain/aggregates/spell-list.js';
import { type SpellListRepository, SPELL_LIST_REPOSITORY } from '../../ports/spell-list-repository.port.js';
import { type SpellListGuardPort, SPELL_LIST_GUARD_PORT } from '../../ports/spell-list-guard.port.js';

@QueryHandler(GetSpellListQuery)
export class GetSpellListHandler implements IQueryHandler<GetSpellListQuery, SpellList> {
  constructor(
    @Inject(SPELL_LIST_REPOSITORY) private readonly spellListRepository: SpellListRepository,
    @Inject(SPELL_LIST_GUARD_PORT) private readonly spellListGuard: SpellListGuardPort,
  ) {}

  async execute(query: GetSpellListQuery): Promise<SpellList> {
    const data = await this.spellListRepository.findById(query.id);
    if (!data) throw new NotFoundError('SpellList', query.id);
    this.spellListGuard.checkRead(data, query.userId, query.roles);
    return data;
  }
}

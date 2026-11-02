import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetSpellListsQuery } from '../queries/get-spell-lists.query.js';
import { Page } from '../../../../shared/application/pagination/page.js';
import { SpellList } from '../../../domain/aggregates/spell-list.js';
import { type SpellListRepository, SPELL_LIST_REPOSITORY } from '../../ports/spell-list-repository.port.js';
import { type SpellListGuardPort, SPELL_LIST_GUARD_PORT } from '../../ports/spell-list-guard.port.js';

@QueryHandler(GetSpellListsQuery)
export class GetSpellListsHandler implements IQueryHandler<GetSpellListsQuery, Page<SpellList>> {
  constructor(
    @Inject(SPELL_LIST_REPOSITORY) private readonly spellListRepository: SpellListRepository,
    @Inject(SPELL_LIST_GUARD_PORT) private readonly spellListGuard: SpellListGuardPort,
  ) {}

  async execute(query: GetSpellListsQuery): Promise<Page<SpellList>> {
    const predicate = this.spellListGuard.buildQueryPredicate(query.userId, query.roles);
    const sort = { name: 'asc' } as const;
    return await this.spellListRepository.findByRsql(query.rsql, query.page, query.size, predicate, sort);
  }
}

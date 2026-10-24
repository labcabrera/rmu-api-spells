import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetSpellListsQuery } from '../queries/get-spell-lists.query';
import { Page } from '../../../../shared/application/pagination/page';
import { SpellList } from '../../../domain/aggregates/spell-list';
import { type SpellListRepository, SPELL_LIST_REPOSITORY } from '../../ports/spell-list-repository.port';
import { type SpellListGuardPort, SPELL_LIST_GUARD_PORT } from '../../ports/spell-list-guard.port';

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

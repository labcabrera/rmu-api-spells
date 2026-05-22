import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetSpellListsQuery } from '../queries/get-spell-lists.query';
import { Page } from 'src/modules/shared/domain/entities/page';
import { SpellList } from 'src/modules/spell-lists/domain/aggregates/spell-list';
import type { SpellListRepository } from '../../ports/spell-list-repository';
import type { SpellListGuardPort } from '../../ports/spell-list-guard.port';

@QueryHandler(GetSpellListsQuery)
export class GetSpellListsHandler implements IQueryHandler<GetSpellListsQuery, Page<SpellList>> {
  constructor(
    @Inject('SpellListRepository') private readonly spellListRepository: SpellListRepository,
    @Inject('SpellListGuardPort') private readonly spellListGuard: SpellListGuardPort,
  ) {}

  async execute(query: GetSpellListsQuery): Promise<Page<SpellList>> {
    const predicate = this.spellListGuard.buildQueryPredicate(query.userId, query.roles);
    const sort = { name: 'asc' } as const;
    return await this.spellListRepository.findByRsql(query.rsql, query.page, query.size, predicate, sort);
  }
}

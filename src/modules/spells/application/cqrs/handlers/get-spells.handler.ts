import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { type SpellListRepository, SPELL_LIST_REPOSITORY } from '../../../../spell-lists/application/ports/spell-list-repository.port.js';
import { type SpellListGuardPort, SPELL_LIST_GUARD_PORT } from '../../../../spell-lists/application/ports/spell-list-guard.port.js';
import { QueryCriteria } from '../../../../shared/application/criteria/query-criteria.js';
import { RMU_ADMIN } from '../../../../shared/domain/entities/user-roles.js';
import { Inject } from '@nestjs/common';
import { Page } from '../../../../shared/application/pagination/page.js';
import { Spell } from '../../../domain/aggregates/spell.js';
import { type SpellRepository, SPELL_REPOSITORY } from '../../ports/spell-repository.port.js';
import { GetSpellsQuery } from '../queries/get-spells.query.js';
import { type SpellGuardPort, SPELL_GUARD_PORT } from '../../ports/spell-guard.port.js';

@QueryHandler(GetSpellsQuery)
export class GetSpellsHandler implements IQueryHandler<GetSpellsQuery, Page<Spell>> {
  constructor(
    @Inject(SPELL_REPOSITORY) private readonly spellRepository: SpellRepository,
    @Inject(SPELL_LIST_REPOSITORY) private readonly spellListRepository: SpellListRepository,
    @Inject(SPELL_LIST_GUARD_PORT) private readonly spellListGuard: SpellListGuardPort,
    @Inject(SPELL_GUARD_PORT) private readonly spellGuard: SpellGuardPort,
  ) {}

  async execute(query: GetSpellsQuery): Promise<Page<Spell>> {
    // A spell is visible when its list is (spec 021): the filter needs the ids of the lists, except for an admin.
    const isAdmin = query.roles.includes(RMU_ADMIN);
    const [readable, all] = isAdmin
      ? [[], []]
      : await Promise.all([
          this.spellListRepository.findIds(this.spellListGuard.buildQueryPredicate(query.userId, query.roles)),
          this.spellListRepository.findIds(QueryCriteria.empty()),
        ]);
    const predicate = this.spellGuard.buildQueryPredicate(query.userId, query.roles, { readable, all });
    const sort = { name: 'asc', level: 'asc' } as const;
    return await this.spellRepository.findByRsql(query.rsql, query.page, query.size, predicate, sort);
  }
}

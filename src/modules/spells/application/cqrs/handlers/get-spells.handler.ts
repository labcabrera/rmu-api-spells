import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Page } from '../../../../shared/application/pagination/page';
import { Spell } from '../../../domain/aggregates/spell';
import { type SpellRepository, SPELL_REPOSITORY } from '../../ports/spell-repository.port';
import { GetSpellsQuery } from '../queries/get-spells.query';
import { type SpellGuardPort, SPELL_GUARD_PORT } from '../../ports/spell-guard.port';

@QueryHandler(GetSpellsQuery)
export class GetSpellsHandler implements IQueryHandler<GetSpellsQuery, Page<Spell>> {
  constructor(
    @Inject(SPELL_REPOSITORY) private readonly spellRepository: SpellRepository,
    @Inject(SPELL_GUARD_PORT) private readonly spellGuard: SpellGuardPort,
  ) {}

  async execute(query: GetSpellsQuery): Promise<Page<Spell>> {
    const predicate = this.spellGuard.buildQueryPredicate(query.userId, query.roles);
    const sort = { name: 'asc', level: 'asc' } as const;
    return await this.spellRepository.findByRsql(query.rsql, query.page, query.size, predicate, sort);
  }
}

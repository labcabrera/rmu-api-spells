import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Page } from 'src/modules/shared/domain/entities/page';
import { Spell } from 'src/modules/spells/domain/aggregates/spell';
import type { SpellRepository } from '../../ports/spell-list-repository';
import { GetSpellsQuery } from '../queries/get-spell-lists.query';

@QueryHandler(GetSpellsQuery)
export class GetSpellsHandler implements IQueryHandler<GetSpellsQuery, Page<Spell>> {
  constructor(@Inject('SpellRepository') private readonly spellRepository: SpellRepository) {}

  async execute(query: GetSpellsQuery): Promise<Page<Spell>> {
    return await this.spellRepository.findByRsql(query.rsql, query.page, query.size, query.sort);
  }
}

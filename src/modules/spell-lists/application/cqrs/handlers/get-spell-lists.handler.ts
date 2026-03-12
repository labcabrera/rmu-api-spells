import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetSpellListsQuery } from '../queries/get-spell-lists.query';
import { Page } from 'src/modules/shared/domain/entities/page';
import { SpellList } from 'src/modules/spell-lists/domain/aggregates/spell-list';
import type { SpellListRepository } from '../../ports/spell-list-repository';

@QueryHandler(GetSpellListsQuery)
export class GetSpellListsHandler implements IQueryHandler<GetSpellListsQuery, Page<SpellList>> {
  constructor(@Inject('SpellListRepository') private readonly spellListRepository: SpellListRepository) {}

  async execute(query: GetSpellListsQuery): Promise<Page<SpellList>> {
    return await this.spellListRepository.findByRsql(query.rsql, query.page, query.size);
  }
}

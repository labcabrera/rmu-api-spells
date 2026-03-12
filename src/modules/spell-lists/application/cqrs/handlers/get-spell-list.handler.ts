import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetSpellListQuery } from '../queries/get-spell-list.query';
import { NotFoundError } from 'src/modules/shared/domain/errors/errors';
import { SpellList } from 'src/modules/spell-lists/domain/aggregates/spell-list';
import type { SpellListRepository } from '../../ports/spell-list-repository';

@QueryHandler(GetSpellListQuery)
export class GetSpellListHandler implements IQueryHandler<GetSpellListQuery, SpellList> {
  constructor(@Inject('SpellListRepository') private readonly spellListRepository: SpellListRepository) {}

  async execute(query: GetSpellListQuery): Promise<SpellList> {
    const data = await this.spellListRepository.findById(query.id);
    if (!data) {
      throw new NotFoundError('SpellList', query.id);
    }
    return data;
  }
}

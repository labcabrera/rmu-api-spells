import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetSpellListQuery } from '../queries/get-spell-list.query';
import { NotFoundError } from 'src/modules/shared/domain/errors/errors';
import { SpellList } from 'src/modules/spell-lists/domain/aggregates/spell-list';
import type { SpellListRepository } from '../../ports/spell-list-repository';
import type { SpellListGuardPort } from '../../ports/spell-list-guard.port';

@QueryHandler(GetSpellListQuery)
export class GetSpellListHandler implements IQueryHandler<GetSpellListQuery, SpellList> {
  constructor(
    @Inject('SpellListRepository') private readonly spellListRepository: SpellListRepository,
    @Inject('SpellListGuardPort') private readonly spellListGuard: SpellListGuardPort,
  ) {}

  async execute(query: GetSpellListQuery): Promise<SpellList> {
    const data = await this.spellListRepository.findById(query.id);
    if (!data) throw new NotFoundError('SpellList', query.id);
    this.spellListGuard.checkRead(data, query.userId, query.roles);
    return data;
  }
}

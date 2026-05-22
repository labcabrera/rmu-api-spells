import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { NotFoundError } from 'src/modules/shared/domain/errors/errors';
import { Spell } from 'src/modules/spells/domain/aggregates/spell';
import type { SpellRepository } from '../../ports/spell-list-repository';
import { GetSpellQuery } from '../queries/get-spell.query';
import type { SpellGuardPort } from '../../ports/spell-guard.port';

@QueryHandler(GetSpellQuery)
export class GetSpellHandler implements IQueryHandler<GetSpellQuery, Spell> {
  constructor(
    @Inject('SpellRepository') private readonly spellRepository: SpellRepository,
    @Inject('SpellGuardPort') private readonly spellGuard: SpellGuardPort,
  ) {}

  async execute(query: GetSpellQuery): Promise<Spell> {
    const data = await this.spellRepository.findById(query.id);
    if (!data) throw new NotFoundError('Spell', query.id);
    this.spellGuard.checkRead(data, query.userId, query.roles);
    return data;
  }
}

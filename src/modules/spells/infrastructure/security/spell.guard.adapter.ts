import { Inject, Injectable } from '@nestjs/common';
import type { SpellGuardPort } from '../../application/ports/spell-guard.port.js';
import { Spell } from '../../domain/aggregates/spell.js';
import type { SpellList } from '../../../spell-lists/domain/aggregates/spell-list.js';
import { SPELL_LIST_GUARD_PORT, type SpellListGuardPort } from '../../../spell-lists/application/ports/spell-list-guard.port.js';
import { QueryCriteria } from '../../../shared/application/criteria/query-criteria.js';
import { ForbiddenError } from '../../../shared/domain/errors/errors.js';
import { RMU_ADMIN } from '../../../shared/domain/entities/user-roles.js';

@Injectable()
export class SpellGuardAdapter implements SpellGuardPort {
  constructor(@Inject(SPELL_LIST_GUARD_PORT) private readonly listGuard: SpellListGuardPort) {}

  checkCreate(list: SpellList, userId: string, roles: string[]): void {
    this.listGuard.checkCreate(roles);
    if (roles.includes(RMU_ADMIN) || list.owner === userId) return;
    throw new ForbiddenError('You do not have permission to add spells to this spell list');
  }

  checkRead(spell: Spell, list: SpellList | null, userId: string, roles: string[]): void {
    if (list) {
      this.listGuard.checkRead(list, userId, roles);
      return;
    }
    if (spell.accessType === 'public' || spell.owner === userId || roles.includes(RMU_ADMIN)) return;
    throw new ForbiddenError('You do not have permission to read this entity');
  }

  checkUpdate(spell: Spell, list: SpellList | null, userId: string, roles: string[]): void {
    if (this.canChange(spell, list, userId, roles)) return;
    throw new ForbiddenError('You do not have permission to update this entity');
  }

  checkDelete(spell: Spell, list: SpellList | null, userId: string, roles: string[]): void {
    if (this.canChange(spell, list, userId, roles)) return;
    throw new ForbiddenError('You do not have permission to delete this entity');
  }

  buildQueryPredicate(userId: string, roles: string[], lists: { readable: string[]; all: string[] }): QueryCriteria {
    if (roles.includes(RMU_ADMIN)) return QueryCriteria.empty();
    const ownAccess = QueryCriteria.anyOf([QueryCriteria.eq('accessType', 'public'), QueryCriteria.eq('owner', userId)]);
    return QueryCriteria.anyOf([
      QueryCriteria.in('spellListId', lists.readable),
      QueryCriteria.allOf([QueryCriteria.notIn('spellListId', lists.all), ownAccess]),
    ]);
  }

  private canChange(spell: Spell, list: SpellList | null, userId: string, roles: string[]): boolean {
    if (roles.includes(RMU_ADMIN)) return true;
    return (list ? list.owner : spell.owner) === userId;
  }
}

import type { QueryCriteria } from '../../../shared/application/criteria/query-criteria.js';
import type { SpellList } from '../../../spell-lists/domain/aggregates/spell-list.js';
import { Spell } from '../../domain/aggregates/spell.js';

/**
 * Permissions of a spell, which depend on its list (spec 021, decision 2): spells are created and changed only in the
 * lists of the user (or by an admin), and a spell is visible when its list is. A spell whose list no longer exists
 * keeps its own owner and access type.
 */
export interface SpellGuardPort {
  /** Adding a spell to the list, or moving one into it. */
  checkCreate(list: SpellList, userId: string, roles: string[]): void;

  checkRead(spell: Spell, list: SpellList | null, userId: string, roles: string[]): void;

  checkUpdate(spell: Spell, list: SpellList | null, userId: string, roles: string[]): void;

  checkDelete(spell: Spell, list: SpellList | null, userId: string, roles: string[]): void;

  /**
   * The filter of the spells the user can read, given the ids of the lists the user can read and of every list (the
   * spells of a list that does not exist keep their own access type).
   */
  buildQueryPredicate(userId: string, roles: string[], lists: { readable: string[]; all: string[] }): QueryCriteria;
}

export const SPELL_GUARD_PORT = Symbol('SpellGuardPort');

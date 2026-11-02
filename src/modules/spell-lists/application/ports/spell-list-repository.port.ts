import { SpellList } from '../../domain/aggregates/spell-list.js';
import type { BaseRepository } from '../../../shared/application/ports/base-repository.port.js';
import type { QueryCriteria } from '../../../shared/application/criteria/query-criteria.js';

export interface SpellListRepository extends BaseRepository<SpellList> {
  /** The ids of the lists that match the filter: the spells take their visibility from them (spec 021). */
  findIds(filter: QueryCriteria): Promise<string[]>;

  /** Whether the owner already has a list with this exact name, other than `exceptId`. */
  existsByOwnerAndName(owner: string, name: string, exceptId?: string): Promise<boolean>;
}

export const SPELL_LIST_REPOSITORY = Symbol('SpellListRepository');

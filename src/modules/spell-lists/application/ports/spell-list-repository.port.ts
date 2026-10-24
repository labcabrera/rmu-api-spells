import { SpellList } from '../../domain/aggregates/spell-list.js';
import type { BaseRepository } from '../../../shared/application/ports/base-repository.port.js';

export type SpellListRepository = BaseRepository<SpellList>;

export const SPELL_LIST_REPOSITORY = Symbol('SpellListRepository');

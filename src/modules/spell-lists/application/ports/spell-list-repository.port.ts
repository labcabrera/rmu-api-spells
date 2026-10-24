import { SpellList } from '../../domain/aggregates/spell-list';
import { BaseRepository } from '../../../shared/application/ports/base-repository.port';

export type SpellListRepository = BaseRepository<SpellList>;

export const SPELL_LIST_REPOSITORY = Symbol('SpellListRepository');

import { BaseRepository } from '../../../shared/application/ports/base-repository.port';
import { Spell } from '../../domain/aggregates/spell';

export type SpellRepository = BaseRepository<Spell>;

export const SPELL_REPOSITORY = Symbol('SpellRepository');

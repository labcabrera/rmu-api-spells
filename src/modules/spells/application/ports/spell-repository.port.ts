import type { BaseRepository } from '../../../shared/application/ports/base-repository.port.js';
import { Spell } from '../../domain/aggregates/spell.js';

export type SpellRepository = BaseRepository<Spell>;

export const SPELL_REPOSITORY = Symbol('SpellRepository');

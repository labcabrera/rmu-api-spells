import { BaseRepository } from '../../../shared/application/ports/base-repository';
import { Spell } from '../../domain/aggregates/spell';

export type SpellRepository = BaseRepository<Spell>;

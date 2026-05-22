import { BaseRepository } from 'src/modules/shared/application/ports/base-repository';
import { Spell } from '../../domain/aggregates/spell';

export type SpellRepository = BaseRepository<Spell>;

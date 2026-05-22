import { SpellList } from '../../domain/aggregates/spell-list';
import { BaseRepository } from 'src/modules/shared/application/ports/base-repository';

export type SpellListRepository = BaseRepository<SpellList>;

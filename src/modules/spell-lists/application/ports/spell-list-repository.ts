import { Page } from 'src/modules/shared/domain/entities/page';
import { SpellList } from '../../domain/aggregates/spell-list';

export interface SpellListRepository {
  findById(id: string): Promise<SpellList | null>;

  findByRsql(rsql: string | undefined, page: number, size: number): Promise<Page<SpellList>>;

  save(entity: SpellList): Promise<SpellList>;

  update(spellListId: string, update: Partial<SpellList>): Promise<SpellList>;

  deleteById(id: string): Promise<SpellList | null>;
}

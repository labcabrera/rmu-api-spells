import { Page } from 'src/modules/shared/domain/entities/page';
import { Spell } from '../../domain/aggregates/spell';

export interface SpellRepository {
  findById(id: string): Promise<Spell | null>;

  findByRsql(rsql: string | undefined, page: number, size: number): Promise<Page<Spell>>;

  save(entity: Spell): Promise<Spell>;

  update(spellId: string, update: Partial<Spell>): Promise<Spell>;

  deleteById(id: string): Promise<Spell | null>;
}

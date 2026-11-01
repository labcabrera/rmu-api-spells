import type { EntitySource } from '../../../shared/domain/entities/entity-source.js';

/** What a spell list holds, read from the spells without depending on their module (it depends on this one). */
export interface SpellListContentsPort {
  countSpells(spellListId: string): Promise<number>;

  /** Gives every spell of the list the source of the list (spec 063), when an admin changes it. */
  setEntitySourceByList(spellListId: string, entitySource: EntitySource): Promise<void>;
}

export const SPELL_LIST_CONTENTS_PORT = Symbol('SpellListContentsPort');

/** What a spell list holds, read from the spells without depending on their module (it depends on this one). */
export interface SpellListContentsPort {
  countSpells(spellListId: string): Promise<number>;
}

export const SPELL_LIST_CONTENTS_PORT = Symbol('SpellListContentsPort');

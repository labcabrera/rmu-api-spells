export const SPELL_TYPES = ['alchemical', 'elemental', 'force', 'informational', 'utility'] as const;

export type SpellType = (typeof SPELL_TYPES)[number];

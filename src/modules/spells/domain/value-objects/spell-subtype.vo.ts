export const SPELL_SUBTYPES = ['ball', 'directed', 'mental-attack', 'subconscious'] as const;

export type SpellSubtype = (typeof SPELL_SUBTYPES)[number];

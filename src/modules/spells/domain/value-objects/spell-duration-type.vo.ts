export const SPELL_DURATION_TYPES = ['concentration', 'permanent', 'lvl', 'rr-failure'] as const;

export type SpellDurationType = (typeof SPELL_DURATION_TYPES)[number];

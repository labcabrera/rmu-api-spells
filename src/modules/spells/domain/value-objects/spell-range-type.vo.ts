export const SPELL_RANGE_TYPES = ['self', 'touch', 'distance', 'sight', 'unlimited', 'varies'] as const;

export type SpellRangeType = (typeof SPELL_RANGE_TYPES)[number];

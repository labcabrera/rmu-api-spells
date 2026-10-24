export const SPELL_RANGE_TYPES = ['self', 'touch', 'distance', 'distance-level'] as const;

export type SpellRangeType = (typeof SPELL_RANGE_TYPES)[number];

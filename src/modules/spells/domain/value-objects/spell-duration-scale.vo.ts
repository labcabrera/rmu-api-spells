export const SPELL_DURATION_SCALES = ['round', 'minute', 'hour', 'day', 'week', 'month', 'year'] as const;

export type SpellDurationScale = (typeof SPELL_DURATION_SCALES)[number];

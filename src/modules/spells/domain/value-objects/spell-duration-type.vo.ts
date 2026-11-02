export const SPELL_DURATION_TYPES = [
  'instant',
  'concentration',
  'fixed',
  'per-level',
  'per-failure',
  'permanent',
  'varies',
  'special',
] as const;

export type SpellDurationType = (typeof SPELL_DURATION_TYPES)[number];

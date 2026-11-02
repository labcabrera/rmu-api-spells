export const SPELL_RESISTANCE_KINDS = ['none', 'realm', 'informational', 'fear', 'willing'] as const;
export const SPELL_RESISTANCE_SCALINGS = ['all-or-nothing', 'per-failure'] as const;

export type SpellResistanceKind = (typeof SPELL_RESISTANCE_KINDS)[number];
export type SpellResistanceScaling = (typeof SPELL_RESISTANCE_SCALINGS)[number];

/** The resistance roll a spell asks of its target (spec 028): which one, its modifier and how failure scales. */
export class SpellResistance {
  constructor(
    public readonly kind: SpellResistanceKind,
    public readonly modifier: number | null,
    public readonly scaling: SpellResistanceScaling,
  ) {}
}

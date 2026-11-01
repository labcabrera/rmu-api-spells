/** The 10 alchemy failure tables (spec 064): the same values as `ALCHEMY_FAILURE_TABLES` in rmu-api-core. */
export const ALCHEMY_FAILURE_TABLES = [
  'bonus',
  'embedded-entity',
  'general',
  'independent-entity',
  'intelligence',
  'location',
  'organism',
  'potion',
  'power-enhancer',
  'spell-power',
] as const;
export type AlchemyFailureTable = (typeof ALCHEMY_FAILURE_TABLES)[number];

/** What an alchemical spell adds to the item it is embedded in (spec 064). */
export const SPELL_ALCHEMY_EFFECT_KINDS = ['attack', 'defense', 'skill', 'spell-adder', 'pp-multiplier'] as const;
export type SpellAlchemyEffectKind = (typeof SPELL_ALCHEMY_EFFECT_KINDS)[number];

export class SpellAlchemyEffect {
  constructor(
    public readonly kind: SpellAlchemyEffectKind,
    /** Bonus, number of spells or multiplier (e.g. 1.25 for a pp-multiplier). */
    public readonly value: number,
  ) {}
}

type PlainAlchemy = Partial<{
  failureTable: AlchemyFailureTable;
  perItem: boolean;
  alters: boolean;
  effect: Partial<{ kind: SpellAlchemyEffectKind; value: number }> | null;
}>;

/** Alchemy metadata of a spell (spec 064, decision 4): how it is embedded in an item. */
export class SpellAlchemy {
  constructor(
    /** The table rolled on when its SCR fails. */
    public readonly failureTable: AlchemyFailureTable,
    /** In a batch it is cast once per unit (Work…, Make…, Enchanting Elixir, Consecration). */
    public readonly perItem: boolean,
    /** Mark `#` of the book: it creates or alters the base item. */
    public readonly alters: boolean,
    public readonly effect: SpellAlchemyEffect | null,
  ) {}

  /** Builds it from a request or a stored document; null when there is none. */
  static fromPlain(plain: Record<string, unknown> | null | undefined): SpellAlchemy | null {
    if (!plain) return null;
    const p = plain as PlainAlchemy;
    if (!p.failureTable) return null;
    const effect =
      p.effect?.kind !== undefined && p.effect.value !== undefined ? new SpellAlchemyEffect(p.effect.kind, p.effect.value) : null;
    return new SpellAlchemy(p.failureTable, p.perItem ?? false, p.alters ?? false, effect);
  }
}

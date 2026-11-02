import { SpellArea, type SpellAreaKind } from './spell-area.vo.js';
import type { SpellDurationScale } from './spell-duration-scale.vo.js';
import { SpellDuration } from './spell-duration.vo.js';
import type { SpellDurationType } from './spell-duration-type.vo.js';
import { SpellRange } from './spell-range.vo.js';
import type { SpellRangeType } from './spell-range-type.vo.js';
import { SpellResistance, type SpellResistanceKind, type SpellResistanceScaling } from './spell-resistance.vo.js';
import type { SpellSubtype } from './spell-subtype.vo.js';
import type { SpellType } from './spell-type.vo.js';

/** A stored or requested range, area, duration or resistance: the fields of spec 028 and those written before it. */
type PlainRange = Partial<{ type: string; value: number | null; perLevel: boolean; increment: number | null; raw: string | null }>;
type PlainArea = Partial<{
  kind: SpellAreaKind;
  count: number | null;
  perLevel: boolean;
  radius: number | null;
  dimensions: string | null;
  targetTypes: string[];
  raw: string | null;
}>;
type LegacyTarget = Partial<{ mode: string; types: string[]; count: number | null; modifier: string | null }>;
type PlainDuration = Partial<{
  type: string;
  value: number | null;
  scale: SpellDurationScale | null;
  perLevel: number | null;
  perFailure: number | null;
  concentration: boolean;
  raw: string | null;
  // Before spec 028.
  duration: number | null;
  durationScale: SpellDurationScale | null;
  failureScale: number | null;
  requiredConcentration: boolean;
}>;
type PlainResistance = Partial<{ kind: SpellResistanceKind; modifier: number | null; scaling: SpellResistanceScaling }>;
type PlainModifiers = Partial<{
  typeCode: string | null;
  type: SpellType | null;
  subtype: SpellSubtype | null;
  instant: boolean;
  powerPoints: number | null;
  setGroup: string | null;
  range: PlainRange | null;
  area: PlainArea | null;
  duration: PlainDuration | null;
  resistance: PlainResistance | null;
  // Before spec 028.
  target: LegacyTarget | null;
  rrModifier: number;
  notRequiredPowerPoints: boolean;
}>;

/** How a spell is cast and what it reaches (spec 028). What it does to its targets is in the spell `effects`. */
export class SpellModifiers {
  constructor(
    /** Type code as printed in the book: `Fm`, `Ed`, `U`… */
    public typeCode: string | null,
    public type: SpellType | null,
    public subtype: SpellSubtype | null,
    /** Instantaneous (`*`). */
    public instant: boolean,
    /** Power points it costs: the level by default, 0 for the spells marked `•`. Null: the level. */
    public powerPoints: number | null,
    /** Spells marked `‡` that are cast together share it. */
    public setGroup: string | null,
    public range: SpellRange | null,
    public area: SpellArea | null,
    public duration: SpellDuration | null,
    public resistance: SpellResistance | null,
  ) {}

  /** The modifiers of a spell stored without them (spec 021, decision 5): every field empty. */
  static empty(): SpellModifiers {
    return new SpellModifiers(null, null, null, false, null, null, null, null, null, null);
  }

  /** A copy with the fields of the patch: a null clears a field, a missing one keeps it (F-spells-19). */
  merge(patch: Partial<SpellModifiers>): SpellModifiers {
    return SpellModifiers.fromPlain({ ...this, ...patch } as Record<string, unknown>);
  }

  /**
   * Builds the modifiers from a plain object: a request or a stored document. Documents stored before spec 028 are read
   * too: `distance-level` range, `lvl`/`rr-failure` duration, `rrModifier` and `notRequiredPowerPoints`.
   */
  static fromPlain(plain: Record<string, unknown> | null | undefined): SpellModifiers {
    if (!plain) return SpellModifiers.empty();
    const p = plain as PlainModifiers;
    const legacyCost = p.notRequiredPowerPoints === true ? 0 : null;
    return new SpellModifiers(
      p.typeCode ?? null,
      p.type ?? null,
      p.subtype ?? null,
      p.instant ?? false,
      p.powerPoints ?? legacyCost,
      p.setGroup ?? null,
      toRange(p.range),
      toArea(p.area, p.target),
      toDuration(p.duration),
      toResistance(p.resistance, p.rrModifier),
    );
  }
}

function toRange(r: PlainRange | null | undefined): SpellRange | null {
  if (!r?.type) return null;
  const legacyPerLevel = r.type === 'distance-level';
  const type = (legacyPerLevel ? 'distance' : r.type) as SpellRangeType;
  return new SpellRange(type, r.value ?? null, r.perLevel ?? legacyPerLevel, r.increment ?? null, r.raw ?? null);
}

function toArea(a: PlainArea | null | undefined, legacyTarget: LegacyTarget | null | undefined): SpellArea | null {
  if (a?.kind) {
    return new SpellArea(
      a.kind,
      a.count ?? null,
      a.perLevel ?? false,
      a.radius ?? null,
      a.dimensions ?? null,
      a.targetTypes ?? [],
      a.raw ?? null,
    );
  }
  if (!legacyTarget?.mode) return null;
  // Before spec 028: target {mode: target|area|volume, types, count}.
  const kind: SpellAreaKind = legacyTarget.mode === 'target' ? 'targets' : legacyTarget.mode === 'volume' ? 'volume' : 'radius';
  return new SpellArea(kind, legacyTarget.count ?? null, false, null, null, legacyTarget.types ?? [], legacyTarget.modifier ?? null);
}

function toDuration(d: PlainDuration | null | undefined): SpellDuration | null {
  if (!d?.type) return null;
  const legacy: Record<string, SpellDurationType> = { lvl: 'per-level', 'rr-failure': 'per-failure' };
  const type = legacy[d.type] ?? d.type;
  const value = d.value ?? d.duration ?? null;
  const scale: SpellDurationScale | null = d.scale ?? d.durationScale ?? null;
  const perLevel = d.perLevel ?? (d.type === 'lvl' ? 1 : null);
  const perFailure = d.perFailure ?? (d.type === 'rr-failure' ? (d.failureScale ?? 1) : null);
  const concentration = d.concentration ?? d.requiredConcentration ?? type === 'concentration';
  return new SpellDuration(type, value, scale, perLevel, perFailure, !!concentration, d.raw ?? null);
}

function toResistance(r: PlainResistance | null | undefined, legacyModifier: unknown): SpellResistance | null {
  if (r?.kind) {
    return new SpellResistance(r.kind, r.modifier ?? null, r.scaling ?? 'all-or-nothing');
  }
  if (typeof legacyModifier === 'number') return new SpellResistance('realm', legacyModifier, 'all-or-nothing');
  return null;
}

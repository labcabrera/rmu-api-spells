import { ValidationError } from '../../../shared/domain/errors/errors.js';
import { SPELL_DURATION_SCALES } from './spell-duration-scale.vo.js';
import { SPELL_DURATION_TYPES } from './spell-duration-type.vo.js';

/**
 * What a spell does to its targets (spec 028): a declarative list that tactical and strategic read. The schema is in
 * specs/028-spell-catalog/plan.md of the workspace. Statuses (`condition.status`, `cure.removes`) are ids of the core
 * effect-types catalog, checked against it by the command handlers.
 */
export const SPELL_EFFECT_KINDS = [
  'attack',
  'critical',
  'damage',
  'heal',
  'condition',
  'modifier',
  'afflict',
  'cure',
  'dispel',
  'protection',
  'summon',
  'movement',
  'information',
  'creation',
  'illusion',
  'transformation',
  'narrative',
] as const;

export type SpellEffectKind = (typeof SPELL_EFFECT_KINDS)[number];

export const ATTACK_TABLES = [
  'fire-bolt',
  'ice-bolt',
  'water-bolt',
  'lightning-bolt',
  'fire-ball',
  'cold-ball',
  'lightning-ball',
  'sling',
  'unarmed-strikes',
];
/** Ids of the critical tables of Core Law (data/core-law/critical-tables): letters and the types with no letter. */
export const CRITICAL_TYPES = ['H', 'O', 'L', 'I', 'K', 'P', 'S', 'U', 'G', 'T', 'W', 'acid', 'holy', 'steam', 'subdual'];
export const INJURY_TYPES = ['bone', 'cut-burn', 'muscle-tendon', 'organ', 'poison-disease', 'skin-tissue'];
export const BODY_LOCATIONS = ['head', 'chest', 'abdomen', 'arm', 'leg'];
export const MODIFIER_STATS = ['ob', 'db', 'rr', 'maneuver', 'skill', 'initiative', 'ap', 'pace', 'hits', 'power-points'];
export const AFFLICTION_TYPES = ['disease', 'poison', 'curse'];
const SEVERITIES = ['light', 'medium', 'severe'];
const APPLIES_TO = ['self', 'target', 'area'];
const COMMON = ['kind', 'appliesTo', 'requiresFailedRr', 'duration', 'note'];
const FIELDS: Partial<Record<SpellEffectKind, string[]>> = {
  attack: ['attackTable', 'attackSize', 'criticalType', 'ob', 'count', 'radius'],
  critical: ['criticalType', 'severity', 'severityOffset', 'perFailure'],
  damage: ['hits', 'dice', 'perLevel'],
  heal: ['hits', 'hitsPerLevel', 'bleeding', 'stunRounds', 'injury', 'tier', 'revive'],
  condition: ['status', 'rounds', 'value'],
  modifier: ['stat', 'value', 'perLevel', 'filter', 'stackGroup'],
  afflict: ['afflictionType', 'severity', 'onset', 'effects', 'curedBy'],
  cure: ['removes'],
  dispel: ['scope'],
  protection: ['against'],
};

/** One effect: the common fields plus the ones of its kind (see FIELDS). */
export type SpellEffect = {
  kind: SpellEffectKind;
  appliesTo?: 'self' | 'target' | 'area';
  requiresFailedRr?: boolean;
  duration?: Record<string, unknown>;
  note?: string;
  [field: string]: unknown;
};

const isInt = (v: unknown, nullable = true) => (v === null || v === undefined ? nullable : Number.isInteger(v));
const isStringList = (v: unknown) => Array.isArray(v) && v.every(x => typeof x === 'string');

/**
 * Checks the shape of the effects and returns the statuses they use (to check against the effect-types catalog).
 * Throws a ValidationError (code `invalid-effect`) naming the first wrong field.
 */
export function validateSpellEffects(effects: unknown): string[] {
  if (!Array.isArray(effects)) throw invalid('effects must be a list');
  const statuses = new Set<string>();
  effects.forEach((effect, i) => validateEffect(effect, `effects[${i}]`, statuses, false));
  return [...statuses];
}

function validateEffect(e: unknown, at: string, statuses: Set<string>, nested: boolean): void {
  if (!e || typeof e !== 'object' || Array.isArray(e)) throw invalid(`${at} must be an object`);
  const effect = e as Record<string, unknown>;
  const kind = effect.kind as SpellEffectKind;
  if (!SPELL_EFFECT_KINDS.includes(kind)) throw invalid(`${at}.kind ${String(effect.kind)} is not valid`);
  const allowed = new Set([...COMMON, ...(FIELDS[kind] ?? [])]);
  const extra = Object.keys(effect).filter(k => !allowed.has(k));
  if (extra.length) throw invalid(`${at} has fields not valid for ${kind}: ${extra.join(', ')}`);
  if (!nested) {
    if (!APPLIES_TO.includes(effect.appliesTo as string)) throw invalid(`${at}.appliesTo must be self, target or area`);
    if (typeof effect.requiresFailedRr !== 'boolean') throw invalid(`${at}.requiresFailedRr must be a boolean`);
  }
  if (effect.note !== undefined && (typeof effect.note !== 'string' || effect.note.length > 160)) {
    throw invalid(`${at}.note must be a text of up to 160 characters`);
  }
  if (effect.duration !== undefined && effect.duration !== null) validateDuration(effect.duration, `${at}.duration`);
  const check = (ok: boolean, field: string) => {
    if (!ok) throw invalid(`${at}.${field} is not valid for ${kind}`);
  };
  switch (kind) {
    case 'attack':
      check(ATTACK_TABLES.includes(effect.attackTable as string), 'attackTable');
      check(['small', 'medium', 'big'].includes(effect.attackSize as string), 'attackSize');
      check(effect.criticalType == null || CRITICAL_TYPES.includes(effect.criticalType as string), 'criticalType');
      check(['directed-spells', 'list-ranks'].includes(effect.ob as string), 'ob');
      check(isInt(effect.count) && isInt(effect.radius), 'count');
      break;
    case 'critical':
      check(CRITICAL_TYPES.includes(effect.criticalType as string), 'criticalType');
      // A fixed severity, or none and an offset (0 or less) from the critical that triggers it: an extra critical on a hit.
      if (effect.severity == null) check(isInt(effect.severityOffset, false) && (effect.severityOffset as number) <= 0, 'severityOffset');
      else check(['A', 'B', 'C', 'D', 'E'].includes(effect.severity as string), 'severity');
      break;
    case 'damage':
      check(isInt(effect.hits) && (effect.hits != null || typeof effect.dice === 'string'), 'hits');
      break;
    case 'heal': {
      const injury = effect.injury as Record<string, unknown> | null | undefined;
      if (injury) {
        check(injury.types == null || (isStringList(injury.types) && injury.types.every(t => INJURY_TYPES.includes(t))), 'injury.types');
        check(
          injury.locations == null || (isStringList(injury.locations) && injury.locations.every(l => BODY_LOCATIONS.includes(l))),
          'injury.locations',
        );
        check(injury.severity == null || SEVERITIES.includes(injury.severity as string), 'injury.severity');
      }
      check(effect.tier == null || ['relief', 'healing', 'true'].includes(effect.tier as string), 'tier');
      check(effect.bleeding == null || effect.bleeding === 'all' || isInt(effect.bleeding), 'bleeding');
      check(isInt(effect.hits) && isInt(effect.hitsPerLevel) && isInt(effect.stunRounds), 'hits');
      break;
    }
    case 'condition':
      check(typeof effect.status === 'string' && effect.status.length > 0, 'status');
      check(isInt(effect.rounds) && isInt(effect.value), 'rounds');
      statuses.add(effect.status as string);
      break;
    case 'modifier':
      check(MODIFIER_STATS.includes(effect.stat as string), 'stat');
      check(isInt(effect.value, false), 'value');
      check(effect.filter == null || isStringList(effect.filter), 'filter');
      break;
    case 'afflict':
      check(AFFLICTION_TYPES.includes(effect.afflictionType as string), 'afflictionType');
      check(effect.severity == null || SEVERITIES.includes(effect.severity as string), 'severity');
      check(effect.curedBy == null || isStringList(effect.curedBy), 'curedBy');
      if (effect.effects != null) {
        check(Array.isArray(effect.effects), 'effects');
        (effect.effects as unknown[]).forEach((sub, i) => {
          const subKind = (sub as Record<string, unknown> | null)?.kind as string;
          if (!['modifier', 'damage', 'condition'].includes(subKind)) {
            throw invalid(`${at}.effects[${i}] must be a modifier, damage or condition`);
          }
          validateEffect(sub, `${at}.effects[${i}]`, statuses, true);
        });
      }
      break;
    case 'cure':
      check(isStringList(effect.removes) && effect.removes.length > 0, 'removes');
      (effect.removes as string[]).filter(r => !AFFLICTION_TYPES.includes(r) && !INJURY_TYPES.includes(r)).forEach(r => statuses.add(r));
      break;
    case 'dispel':
      check(['spell', 'list', 'realm', 'all'].includes(effect.scope as string), 'scope');
      break;
    case 'protection':
      check(isStringList(effect.against) && effect.against.length > 0, 'against');
      break;
    default:
      break;
  }
}

function validateDuration(d: unknown, at: string): void {
  const duration = d as Record<string, unknown>;
  if (typeof d !== 'object' || !(SPELL_DURATION_TYPES as readonly string[]).includes(duration.type as string)) {
    throw invalid(`${at}.type is not valid`);
  }
  if (duration.scale != null && !(SPELL_DURATION_SCALES as readonly string[]).includes(duration.scale as string)) {
    throw invalid(`${at}.scale is not valid`);
  }
}

function invalid(message: string): ValidationError {
  return new ValidationError(message, 'invalid-effect');
}

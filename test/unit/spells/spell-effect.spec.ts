import { validateSpellEffects } from '../../../src/modules/spells/domain/value-objects/spell-effect.vo.js';
import { ValidationError } from '../../../src/modules/shared/domain/errors/errors.js';

const base = { appliesTo: 'target', requiresFailedRr: true };

describe('validateSpellEffects', () => {
  it('returns the statuses of conditions, of periodic effects and of cures', () => {
    const statuses = validateSpellEffects([
      { ...base, kind: 'condition', status: 'stunned', rounds: 2, value: -25 },
      {
        ...base,
        kind: 'afflict',
        afflictionType: 'disease',
        severity: 'medium',
        effects: [{ kind: 'condition', status: 'fatigue', rounds: null, value: -10 }],
        curedBy: ['purifications'],
      },
      { ...base, kind: 'cure', removes: ['asleep', 'poison', 'bone'] },
      { ...base, kind: 'attack', attackTable: 'fire-bolt', attackSize: 'medium', criticalType: 'H', ob: 'directed-spells' },
    ]);
    expect(statuses.sort()).toEqual(['asleep', 'fatigue', 'stunned']);
  });

  it('accepts a critical relative to the one that triggers it', () => {
    expect(() =>
      validateSpellEffects([{ ...base, kind: 'critical', criticalType: 'U', severity: null, severityOffset: -1 }]),
    ).not.toThrow();
    expect(() => validateSpellEffects([{ ...base, kind: 'critical', criticalType: 'U', severity: null, severityOffset: 1 }])).toThrow(
      ValidationError,
    );
  });

  it('accepts every kind with its fields', () => {
    const effects = [
      { ...base, kind: 'damage', hits: null, dice: '1d10', perLevel: true },
      {
        ...base,
        kind: 'heal',
        hits: 10,
        hitsPerLevel: null,
        bleeding: 'all',
        stunRounds: 2,
        injury: { types: ['bone'], locations: ['arm'], severity: 'light' },
        tier: 'healing',
        revive: false,
      },
      { ...base, kind: 'modifier', stat: 'db', value: 10, perLevel: false, filter: ['melee'], stackGroup: 'aura' },
      { ...base, kind: 'dispel', scope: 'realm' },
      { ...base, kind: 'protection', against: ['fire'] },
      { ...base, kind: 'condition', status: 'asleep', rounds: null, value: null, duration: { type: 'fixed', value: 1, scale: 'hour' } },
      { ...base, kind: 'attack', attackTable: 'fire-ball', attackSize: 'big', criticalType: null, ob: 'list-ranks', count: 1, radius: 20 },
      { ...base, kind: 'summon' },
    ];
    expect(validateSpellEffects(effects)).toEqual(['asleep']);
    expect(validateSpellEffects([])).toEqual([]);
  });

  it('rejects a value that is not a list', () => {
    expect(() => validateSpellEffects({ kind: 'damage' })).toThrow(ValidationError);
    expect(() => validateSpellEffects([null])).toThrow(ValidationError);
  });

  it.each([
    ['an unknown kind', { ...base, kind: 'teleport' }],
    ['a field of another kind', { ...base, kind: 'damage', hits: 10, status: 'stunned' }],
    ['no appliesTo', { kind: 'damage', requiresFailedRr: false, hits: 10 }],
    ['an unknown attack table', { ...base, kind: 'attack', attackTable: 'acid-bolt', attackSize: 'small', ob: 'list-ranks' }],
    ['a severity out of A-E', { ...base, kind: 'critical', criticalType: 'H', severity: 'F' }],
    ['an unknown stat', { ...base, kind: 'modifier', stat: 'luck', value: 10 }],
    ['an unknown injury type', { ...base, kind: 'heal', injury: { types: ['soul'] } }],
    ['a periodic attack', { ...base, kind: 'afflict', afflictionType: 'curse', effects: [{ kind: 'attack' }] }],
    ['a long note', { ...base, kind: 'narrative', note: 'x'.repeat(161) }],
    ['a wrong duration', { ...base, kind: 'condition', status: 'stunned', duration: { type: 'forever' } }],
    ['a wrong duration scale', { ...base, kind: 'condition', status: 'stunned', duration: { type: 'fixed', scale: 'century' } }],
    ['no requiresFailedRr', { kind: 'damage', appliesTo: 'self', hits: 1 }],
    ['damage without hits or dice', { ...base, kind: 'damage' }],
    ['a condition without status', { ...base, kind: 'condition', status: '' }],
    ['a condition with text rounds', { ...base, kind: 'condition', status: 'stunned', rounds: 'two' }],
    ['a modifier without value', { ...base, kind: 'modifier', stat: 'ob' }],
    ['a modifier with a text filter', { ...base, kind: 'modifier', stat: 'ob', value: 5, filter: 'melee' }],
    ['an unknown affliction', { ...base, kind: 'afflict', afflictionType: 'hex' }],
    ['an affliction severity', { ...base, kind: 'afflict', afflictionType: 'poison', severity: 'deadly' }],
    ['curedBy that is not a list', { ...base, kind: 'afflict', afflictionType: 'poison', curedBy: 'undisease' }],
    ['periodic effects that are not a list', { ...base, kind: 'afflict', afflictionType: 'poison', effects: 'x' }],
    ['an empty cure', { ...base, kind: 'cure', removes: [] }],
    ['an unknown dispel scope', { ...base, kind: 'dispel', scope: 'world' }],
    ['a protection against nothing', { ...base, kind: 'protection', against: [] }],
    ['an unknown heal tier', { ...base, kind: 'heal', tier: 'instant' }],
    ['a text bleeding', { ...base, kind: 'heal', bleeding: 'some' }],
    ['an unknown injury location', { ...base, kind: 'heal', injury: { locations: ['tail'] } }],
    ['an unknown injury severity', { ...base, kind: 'heal', injury: { severity: 'mortal' } }],
    ['an unknown attack size', { ...base, kind: 'attack', attackTable: 'fire-bolt', attackSize: 'huge', ob: 'list-ranks' }],
    [
      'an unknown attack critical',
      { ...base, kind: 'attack', attackTable: 'fire-bolt', attackSize: 'small', criticalType: 'Z', ob: 'list-ranks' },
    ],
    ['an unknown attack OB', { ...base, kind: 'attack', attackTable: 'fire-bolt', attackSize: 'small', ob: 'fixed' }],
    ['a text attack count', { ...base, kind: 'attack', attackTable: 'fire-bolt', attackSize: 'small', ob: 'list-ranks', count: 'two' }],
    ['an unknown critical type', { ...base, kind: 'critical', criticalType: 'Z', severity: 'A' }],
  ])('rejects %s', (_name, effect) => {
    expect(() => validateSpellEffects([effect])).toThrow(expect.objectContaining({ code: 'invalid-effect' }) as unknown);
  });
});

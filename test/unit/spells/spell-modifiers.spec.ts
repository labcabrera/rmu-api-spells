import { SpellModifiers } from '../../../src/modules/spells/domain/value-objects/spell-modifiers.vo.js';

describe('SpellModifiers', () => {
  it('reads the modifiers stored before spec 028', () => {
    const modifiers = SpellModifiers.fromPlain({
      type: 'force',
      range: { type: 'distance-level', value: 10 },
      duration: { type: 'rr-failure', duration: 1, durationScale: 'round', failureScale: 5, requiredConcentration: false },
      target: { mode: 'target', types: ['person'], count: 1, modifier: null },
      rrModifier: -10,
      notRequiredPowerPoints: true,
    });
    expect(modifiers).toMatchObject({
      type: 'force',
      powerPoints: 0,
      range: { type: 'distance', value: 10, perLevel: true },
      duration: { type: 'per-failure', value: 1, scale: 'round', perFailure: 5, concentration: false },
      area: { kind: 'targets', count: 1, targetTypes: ['person'] },
      resistance: { kind: 'realm', modifier: -10, scaling: 'all-or-nothing' },
    });
  });

  it('merges a patch: a null clears a field and a missing one keeps it', () => {
    const stored = SpellModifiers.fromPlain({ typeCode: 'Fm', type: 'force', range: { type: 'touch' }, instant: true });
    const merged = stored.merge({ type: null, powerPoints: 3 });
    expect(merged).toMatchObject({ typeCode: 'Fm', type: null, powerPoints: 3, instant: true, range: { type: 'touch', value: null } });
  });

  it('reads every legacy target mode and duration', () => {
    const volume = SpellModifiers.fromPlain({ target: { mode: 'volume', modifier: "10'x10'" }, duration: { type: 'lvl', duration: 1 } });
    expect(volume).toMatchObject({ area: { kind: 'volume', count: null, targetTypes: [], raw: "10'x10'" }, duration: { perLevel: 1 } });
    const area = SpellModifiers.fromPlain({ target: { mode: 'area' }, duration: { type: 'rr-failure' }, rrModifier: 'x' });
    expect(area).toMatchObject({ area: { kind: 'radius' }, duration: { type: 'per-failure', perFailure: 1 }, resistance: null });
    const none = SpellModifiers.fromPlain({ target: {}, range: {}, duration: {}, resistance: {} });
    expect(none).toMatchObject({ area: null, range: null, duration: null, resistance: null });
    const current = SpellModifiers.fromPlain({
      area: { kind: 'targets', count: 2, perLevel: true, targetTypes: ['person'], raw: '2 targets/lvl' },
      duration: { type: 'concentration' },
      resistance: { kind: 'fear', scaling: 'per-failure' },
    });
    expect(current).toMatchObject({
      area: { kind: 'targets', count: 2, perLevel: true, radius: null },
      duration: { type: 'concentration', concentration: true },
      resistance: { kind: 'fear', modifier: null, scaling: 'per-failure' },
    });
  });

  it('reads a missing document as empty modifiers', () => {
    expect(SpellModifiers.fromPlain(undefined)).toEqual(SpellModifiers.empty());
  });
});

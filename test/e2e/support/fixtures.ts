// Valid request bodies for each resource, with the fields a test cares about passed as overrides.
type Body = Record<string, unknown>;

export const spellListBody = (overrides: Body = {}): Body => ({
  name: `E2E list ${Math.random().toString(36).slice(2, 10)}`,
  realms: ['essence'],
  type: 'open',
  accessType: 'private',
  description: 'A list of the suite',
  ...overrides,
});

export const spellModifiers = (overrides: Body = {}): Body => ({
  typeCode: 'Eb',
  type: 'elemental',
  subtype: 'ball',
  instant: false,
  powerPoints: null,
  setGroup: null,
  range: { type: 'distance', value: 30, perLevel: false, increment: null, raw: "30'" },
  area: { kind: 'radius', count: null, perLevel: false, radius: 10, dimensions: null, targetTypes: ['person'], raw: "10' R" },
  duration: { type: 'concentration', value: null, scale: null, perLevel: null, perFailure: null, concentration: true, raw: 'C' },
  resistance: { kind: 'realm', modifier: -10, scaling: 'all-or-nothing' },
  ...overrides,
});

export const stunEffect = (overrides: Body = {}): Body => ({
  kind: 'condition',
  appliesTo: 'target',
  requiresFailedRr: true,
  status: 'stunned',
  rounds: 2,
  value: null,
  ...overrides,
});

export const spellBody = (spellListId: string, overrides: Body = {}): Body => ({
  spellListId,
  name: 'E2E spell',
  level: 3,
  modifiers: spellModifiers(),
  accessType: 'private',
  description: 'A spell of the suite',
  ...overrides,
});

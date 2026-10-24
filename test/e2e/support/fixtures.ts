// Valid request bodies for each resource, with the fields a test cares about passed as overrides.
type Body = Record<string, unknown>;

export const spellListBody = (overrides: Body = {}): Body => ({
  name: `E2E list ${Math.random().toString(36).slice(2, 10)}`,
  realm: 'essence',
  type: 'open',
  accessType: 'private',
  description: 'A list of the suite',
  ...overrides,
});

export const spellModifiers = (overrides: Body = {}): Body => ({
  type: 'elemental',
  subtype: 'ball',
  range: { type: 'distance', value: 30 },
  duration: { type: 'concentration', duration: 1, durationScale: 'round', requiredConcentration: true, failureScale: null },
  target: { mode: 'area', types: ['person'], count: null, modifier: '10 ft radius' },
  rrModifier: -10,
  instant: false,
  notRequiredPowerPoints: false,
  partOfSetOfSpells: false,
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

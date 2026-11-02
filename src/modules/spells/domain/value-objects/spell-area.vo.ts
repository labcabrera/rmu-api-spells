export const SPELL_AREA_KINDS = ['caster', 'targets', 'radius', 'volume', 'object', 'varies'] as const;

export type SpellAreaKind = (typeof SPELL_AREA_KINDS)[number];

/** Kinds of target of an area. The importer maps the nouns of the book to them, and `other` takes the rest. */
export const SPELL_TARGET_TYPES = [
  'person',
  'creature',
  'animal',
  'plant',
  'undead',
  'demon',
  'elemental',
  'entity',
  'familiar',
  'corpse',
  'limb',
  'item',
  'object',
  'weapon',
  'armor',
  'missile',
  'attack',
  'spell',
  'symbol',
  'curse',
  'poison',
  'disease',
  'herb',
  'gateway',
  'lock',
  'door',
  'trap',
  'location',
  'other',
];

/** Area of effect of a spell (spec 028): replaces the target. Distances are in feet. */
export class SpellArea {
  constructor(
    public readonly kind: SpellAreaKind,
    public readonly count: number | null,
    public readonly perLevel: boolean,
    public readonly radius: number | null,
    /** Volumes and compound measures, as normalized text. */
    public readonly dimensions: string | null,
    public readonly targetTypes: string[],
    public readonly raw: string | null,
  ) {}
}

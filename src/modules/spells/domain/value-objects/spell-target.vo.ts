export const SPELL_TARGET_MODES = ['target', 'area', 'volume'] as const;

export type SpellTargetMode = (typeof SPELL_TARGET_MODES)[number];
export type SpellTargetType = 'person' | 'item' | 'spell' | 'gateway' | 'lock' | 'plant' | 'animal' | 'other';

export const SPELL_TARGET_TYPES: SpellTargetType[] = ['person', 'item', 'spell', 'gateway', 'lock', 'plant', 'animal', 'other'];

export class SpellTarget {
  constructor(
    public readonly mode: SpellTargetMode,
    public readonly types: SpellTargetType[] | null,
    public readonly count: number | null,
    public readonly modifier: string | null,
  ) {}
}

export type SpellTargetMode = 'target' | 'area' | 'volume';
export type SpellTargetType = 'person' | 'item' | 'spell' | 'gateway' | 'lock' | 'plant' | 'animal' | 'other';

export const SPELL_TARGET_TYPES: SpellTargetType[] = ['person', 'item', 'spell', 'gateway', 'lock', 'other', 'plant', 'animal', 'other'];

export class SpellTarget {
  constructor(
    public readonly mode: SpellTargetMode,
    public readonly types: SpellTargetType[] | null,
    public readonly count: number | null,
    public readonly modifier: string | null,
  ) {}
}

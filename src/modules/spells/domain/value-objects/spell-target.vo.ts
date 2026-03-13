export type SpellTargetMode = 'target' | 'area' | 'volume';
export type SpellTargetType = 'person' | 'item' | 'spell' | 'gateway' | 'lock';

export class SpellTarget {
  constructor(
    public readonly mode: SpellTargetMode,
    public readonly types: SpellTargetType[] | null,
    public readonly count: number | null,
    public readonly modifier: string | null,
  ) {}
}

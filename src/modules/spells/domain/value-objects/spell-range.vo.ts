import type { SpellRangeType } from './spell-range-type.vo.js';

export class SpellRange {
  constructor(
    public readonly type: SpellRangeType,
    public readonly value: number | null,
  ) {}
}

import { SpellRangeType } from './spell-range-type.vo';

export class SpellRange {
  constructor(
    public readonly type: SpellRangeType,
    public readonly value: number | null,
  ) {}
}

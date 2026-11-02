import type { SpellRangeType } from './spell-range-type.vo.js';

/** Range of a spell (spec 028): the structured value and the book text it comes from. Distances are in feet. */
export class SpellRange {
  constructor(
    public readonly type: SpellRangeType,
    public readonly value: number | null,
    public readonly perLevel: boolean,
    /** Range increment of the directed spells (`<25'>`). */
    public readonly increment: number | null,
    public readonly raw: string | null,
  ) {}
}

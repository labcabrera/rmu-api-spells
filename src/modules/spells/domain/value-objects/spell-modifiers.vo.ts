import { SpellDuration } from './spell-duration.vo.js';
import { SpellRange } from './spell-range.vo.js';
import type { SpellSubtype } from './spell-subtype.vo.js';
import type { SpellType } from './spell-type.vo.js';
import { SpellTarget } from './spell-target.vo.js';

export class SpellModifiers {
  constructor(
    public type: SpellType,
    public subtype: SpellSubtype | null,
    public range: SpellRange | null,
    public duration: SpellDuration | null,
    public target: SpellTarget | null,
    public rrModifier: number | null,
    public instant: boolean | null,
    public notRequiredPowerPoints: boolean | null,
    public partOfSetOfSpells: boolean | null,
  ) {}
}

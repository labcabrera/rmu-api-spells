import { SpellDuration } from './spell-duration.vo.js';
import { SpellRange } from './spell-range.vo.js';
import type { SpellSubtype } from './spell-subtype.vo.js';
import type { SpellType } from './spell-type.vo.js';
import { SpellTarget } from './spell-target.vo.js';

export class SpellModifiers {
  constructor(
    public type: SpellType | null,
    public subtype: SpellSubtype | null,
    public range: SpellRange | null,
    public duration: SpellDuration | null,
    public target: SpellTarget | null,
    public rrModifier: number | null,
    public instant: boolean | null,
    public notRequiredPowerPoints: boolean | null,
    public partOfSetOfSpells: boolean | null,
  ) {}

  /** The modifiers of a spell stored without them (spec 021, decision 5): every field empty. */
  static empty(): SpellModifiers {
    return new SpellModifiers(null, null, null, null, null, null, null, null, null);
  }
}

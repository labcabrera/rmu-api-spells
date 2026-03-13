import { SpellDuration } from './spell-duration.vo';
import { SpellRange } from './spell-range.vo';
import { SpellSubtype } from './spell-subtype.vo';
import { SpellType } from './spell-type.vo';

export class SpellModifiers {
  constructor(
    public type: SpellType,
    public subtype: SpellSubtype | null,
    public range: SpellRange | null,
    public duration: SpellDuration | null,
    public area: string | null,
    public rrModifier: number | null,
    public instant: boolean | null,
    public notRequiredPowerPoints: boolean | null,
    public partOfSetOfSpells: boolean | null,
  ) {}
}

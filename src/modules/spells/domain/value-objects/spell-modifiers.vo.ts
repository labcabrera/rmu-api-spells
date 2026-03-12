import { SpellDuration } from './spell-duration.vo';
import { SpellSubtype } from './spell-subtype.vo';
import { SpellType } from './spell-type.vo';

export class SpellModifiers {
  constructor(
    public type: SpellType | undefined,
    public subtype: SpellSubtype | undefined,
    public duration: SpellDuration | undefined,
    public area: string | undefined,
    public rrModifier: number | undefined,
    public instant: boolean | undefined,
    public notRequiredPowerPoints: boolean | undefined,
    public partOfSetOfSpells: boolean | undefined,
  ) {}
}

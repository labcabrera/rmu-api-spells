import { SpellSubType } from './spell-subtype.vo';
import { SpellType } from './spell-type.vo';

export class SpellModifiers {
  constructor(
    public type: SpellType | undefined,
    public subType: SpellSubType | undefined,
    public rrModifier: number | undefined,
    public instant: boolean | undefined,
    public notRequiredPowerPoints: boolean | undefined,
    public partOfSetOfSpells: boolean | undefined,
  ) {}
}

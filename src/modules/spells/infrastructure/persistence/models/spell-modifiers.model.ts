import { Prop, Schema } from '@nestjs/mongoose';
import { SpellSubtype } from 'src/modules/spells/domain/value-objects/spell-subtype.vo';
import { SpellType } from 'src/modules/spells/domain/value-objects/spell-type.vo';
import { SpellDuration } from './spell-duration.model';
import { SpellRange } from './spell-range.model';
import { SpellTarget } from './spell-target.model';

@Schema({ id: false, _id: false })
export class SpellModifiers {
  @Prop({ type: String, required: false })
  type: SpellType | null;

  @Prop({ type: String, required: false })
  subType: SpellSubtype | null;

  @Prop({ type: SpellRange, required: false })
  range: SpellRange | null;

  @Prop({ type: SpellDuration, required: false })
  duration: SpellDuration | null;

  @Prop({ type: SpellTarget, required: false })
  target: SpellTarget | null;

  @Prop({ type: Number, required: false })
  rrModifier: number | null;

  @Prop({ type: Boolean, required: false })
  instant: boolean | null;

  @Prop({ type: Boolean, required: false })
  notRequiredPowerPoints: boolean | null;

  @Prop({ type: Boolean, required: false })
  partOfSetOfSpells: boolean | null;
}

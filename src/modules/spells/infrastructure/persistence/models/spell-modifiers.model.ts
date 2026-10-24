import { Prop, Schema } from '@nestjs/mongoose';
import type { SpellSubtype } from '../../../domain/value-objects/spell-subtype.vo.js';
import type { SpellType } from '../../../domain/value-objects/spell-type.vo.js';
import { SpellDuration } from './spell-duration.model.js';
import { SpellRange } from './spell-range.model.js';
import { SpellTarget } from './spell-target.model.js';

@Schema({ id: false, _id: false })
export class SpellModifiers {
  @Prop({ type: String, required: false })
  type: SpellType | null;

  @Prop({ type: String, required: false })
  subtype: SpellSubtype | null;

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

import { Prop, Schema } from '@nestjs/mongoose';
import { SpellSubtype } from 'src/modules/spells/domain/value-objects/spell-subtype.vo';
import { SpellType } from 'src/modules/spells/domain/value-objects/spell-type.vo';
import { SpellDuration } from './spell-duration.model';

@Schema({ id: false, _id: false })
export class SpellModifiers {
  @Prop({ type: String, required: false })
  type: SpellType | undefined;

  @Prop({ type: String, required: false })
  subType: SpellSubtype | undefined;

  @Prop({ type: SpellDuration, required: false })
  duration: SpellDuration | undefined;

  @Prop({ type: String, required: false })
  area: string | undefined;

  @Prop({ type: Number, required: false })
  rrModifier: number | undefined;

  @Prop({ type: Boolean, required: false })
  instant: boolean | undefined;

  @Prop({ type: Boolean, required: false })
  notRequiredPowerPoints: boolean | undefined;

  @Prop({ type: Boolean, required: false })
  partOfSetOfSpells: boolean | undefined;
}

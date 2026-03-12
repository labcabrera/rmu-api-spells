import { Prop, Schema } from '@nestjs/mongoose';
import { SpellDuration } from 'src/modules/spells/domain/value-objects/spell-duration.vo';
import { SpellSubType } from 'src/modules/spells/domain/value-objects/spell-subtype.vo';
import { SpellType } from 'src/modules/spells/domain/value-objects/spell-type.vo';

@Schema()
export class SpellModifiers {
  @Prop({ type: String, required: false })
  type: SpellType | undefined;

  @Prop({ type: String, required: false })
  subType: SpellSubType | undefined;

  @Prop({ type: String, required: false })
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

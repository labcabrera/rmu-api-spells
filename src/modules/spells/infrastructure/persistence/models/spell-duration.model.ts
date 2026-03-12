import { Prop, Schema } from '@nestjs/mongoose';
import { SpellDurationScale } from 'src/modules/spells/domain/value-objects/spell-duration-scale.vo';
import { SpellDurationType } from 'src/modules/spells/domain/value-objects/spell-duration-type.vo';

@Schema({ id: false, _id: false })
export class SpellDuration {
  @Prop({ type: String, required: false })
  type: SpellDurationType | undefined;

  @Prop({ type: Number, required: false })
  duration: number | undefined;

  @Prop({ type: String, required: false })
  durationScale: SpellDurationScale | undefined;
}

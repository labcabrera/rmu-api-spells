import { Prop, Schema } from '@nestjs/mongoose';
import type { SpellRangeType } from 'src/modules/spells/domain/value-objects/spell-range-type.vo';

@Schema({ id: false, _id: false })
export class SpellRange {
  @Prop({ type: String, required: false })
  type: SpellRangeType;

  @Prop({ type: Number, required: false })
  value: number | null;
}

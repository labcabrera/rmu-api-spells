import { Prop, Schema } from '@nestjs/mongoose';
import type { SpellTargetMode, SpellTargetType } from 'src/modules/spells/domain/value-objects/spell-target.vo';

@Schema({ id: false, _id: false })
export class SpellTarget {
  @Prop({ type: String, required: true })
  mode: SpellTargetMode;

  @Prop({ type: [String], required: false })
  types: SpellTargetType[] | null;

  @Prop({ type: Number, required: false })
  count: number | null;

  @Prop({ type: String, required: false })
  modifier: string | null;
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Spell } from 'src/modules/spells/domain/aggregates/spell';

export type SpellDocument = Spell & Document;

@Schema({ collection: 'spells', versionKey: false })
export class SpellModel {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  shortDescription?: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ type: String, required: false })
  imageUrl: string | undefined;

  @Prop({ required: true })
  owner: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: false })
  updatedAt?: Date;
}

export const SpellSchema = SchemaFactory.createForClass(SpellModel);

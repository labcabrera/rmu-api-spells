import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import type { AccessType } from '../../../../shared/domain/entities/access-type.js';
import { SpellModifiers } from './spell-modifiers.model.js';

export type SpellDocument = HydratedDocument<SpellModel>;

@Schema({ collection: 'spells', versionKey: false })
export class SpellModel {
  @Prop({ required: true })
  _id: string;

  @Prop({ type: String, required: false })
  spellListId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Number, required: true })
  level: number;

  @Prop({ type: String, required: false })
  accessType: AccessType;

  @Prop({ required: false })
  description?: string;

  @Prop({ type: SpellModifiers, required: false })
  modifiers: SpellModifiers | undefined;

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

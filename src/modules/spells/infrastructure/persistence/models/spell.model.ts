import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import type { AccessType } from '../../../../shared/domain/entities/access-type.js';

export type SpellDocument = HydratedDocument<SpellModel>;

@Schema({ collection: 'spells', versionKey: false })
export class SpellModel {
  @Prop({ required: true })
  _id: string;

  /** Optimistic concurrency: +1 on each write. Documents stored before it existed have none (version 0). */
  @Prop({ type: Number, default: 0 })
  version: number;

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

  /**
   * Casting parameters (spec 028). Stored as a plain object: SpellModifiers.fromPlain reads it, also in the shape
   * stored before spec 028.
   */
  @Prop({ type: Object, required: false })
  modifiers: Record<string, unknown> | undefined;

  /** Id of the spell it is defined from (spec 028). */
  @Prop({ type: String, required: false })
  basedOn: string | null;

  /** What it does to its targets (spec 028); validated by the domain (validateSpellEffects). */
  @Prop({ type: [Object], default: undefined })
  effects: Record<string, unknown>[] | undefined;

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
SpellSchema.index({ spellListId: 1, level: 1 });

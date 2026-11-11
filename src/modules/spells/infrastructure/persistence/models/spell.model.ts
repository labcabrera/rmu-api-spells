import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import type { AccessType } from '../../../../shared/domain/entities/access-type.js';
import { ENTITY_SOURCES, type EntitySource } from '../../../../shared/domain/entities/entity-source.js';

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

  /** Spec 063: the source of its list. Documents stored before it have none: they are read as `user`. */
  @Prop({ type: String, enum: ENTITY_SOURCES, required: true, default: 'user' })
  entitySource: EntitySource;

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

  /** Alchemy metadata (spec 064); read with SpellAlchemy.fromPlain. Documents stored before it have none. */
  @Prop({ type: Object, required: false, default: undefined })
  alchemy: Record<string, unknown> | null | undefined;

  @Prop({ type: String, required: false, default: null })
  imageUrl: string | null;

  @Prop({ required: true })
  owner: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: false })
  updatedAt?: Date;
}

export const SpellSchema = SchemaFactory.createForClass(SpellModel);
SpellSchema.index({ spellListId: 1, level: 1 });

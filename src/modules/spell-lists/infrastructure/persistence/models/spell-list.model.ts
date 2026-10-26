import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import type { AccessType } from '../../../../shared/domain/entities/access-type.js';
import type { ListType } from '../../../domain/value-objects/list-type.vo.js';
import type { RealmType } from '../../../domain/value-objects/realm-type.vo.js';

export type SpellListDocument = HydratedDocument<SpellListModel>;

@Schema({ collection: 'spell-lists', versionKey: false })
export class SpellListModel {
  @Prop({ required: true })
  _id: string;

  /** Optimistic concurrency: +1 on each write. Documents stored before it existed have none (version 0). */
  @Prop({ type: Number, default: 0 })
  version: number;

  @Prop({ required: true })
  name: string;

  /** Spec 028: one or two realms. Documents stored before it have `realm` (read as `[realm]`). */
  @Prop({ type: [String], default: undefined })
  realms: RealmType[] | undefined;

  /** Before spec 028; kept to read old documents. */
  @Prop({ type: String, required: false })
  realm: RealmType | undefined;

  @Prop({ type: String, required: true })
  type: ListType;

  @Prop({ type: String, required: false })
  code: string | null;

  @Prop({ type: String, required: false })
  bookSection: string | null;

  @Prop({ type: String, required: false })
  professionId: string | null;

  @Prop({ type: String, required: false, default: 'public' })
  accessType: AccessType;

  @Prop({ type: String, required: false })
  description: string | null;

  @Prop({ type: String, required: false })
  imageUrl: string | null;

  @Prop({ type: String, required: true })
  owner: string;

  @Prop({ type: Date, required: true })
  createdAt: Date;

  @Prop({ type: Date, required: false })
  updatedAt: Date | null;
}

export const SpellListSchema = SchemaFactory.createForClass(SpellListModel);
SpellListSchema.index({ name: 1 });
SpellListSchema.index({ code: 1 });

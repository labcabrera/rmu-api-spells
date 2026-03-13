import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SpellList } from 'src/modules/spell-lists/domain/aggregates/spell-list';
import type { ListType } from 'src/modules/spell-lists/domain/value-objects/list-type.vo';
import type { RealmType } from 'src/modules/spell-lists/domain/value-objects/realm-type.vo';

export type SpellListDocument = SpellList & Document;

@Schema({ collection: 'spellLists', versionKey: false })
export class SpellListModel {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, required: true })
  realm: RealmType;

  @Prop({ type: String, required: true })
  type: ListType;

  @Prop({ type: String, required: false })
  professionId: string | null;

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

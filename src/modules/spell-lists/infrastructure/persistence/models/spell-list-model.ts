import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SpellList } from 'src/modules/spell-lists/domain/aggregates/spell-list';

export type SpellListDocument = SpellList & Document;

@Schema({ collection: 'spellLists', versionKey: false })
export class SpellListModel {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: String })
  realm: import('src/modules/spell-lists/domain/value-objects/realm-type.vo').RealmType;

  @Prop({ required: true, type: String })
  type: import('src/modules/spell-lists/domain/value-objects/realm-type.vo').RealmType;

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

export const SpellListSchema = SchemaFactory.createForClass(SpellListModel);

import { Injectable } from '@nestjs/common';
import { SpellListModel, SpellListDocument } from '../persistence/models/spell-list-model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { RsqlParser } from 'src/modules/shared/infrastructure/persistence/repositories/rsql-parser';
import { SpellListRepository } from '../../application/ports/spell-list-repository';
import { SpellList } from '../../domain/aggregates/spell-list';
import { MongoBaseRepository } from 'src/modules/shared/infrastructure/db/mongo.base.repository';

@Injectable()
export class MongoSpellListRepository extends MongoBaseRepository<SpellList, SpellListDocument> implements SpellListRepository {
  constructor(@InjectModel(SpellListModel.name) realmModel: Model<SpellListDocument>, rsqlParser: RsqlParser) {
    super(realmModel, rsqlParser);
  }

  protected mapToEntity(doc: SpellListDocument): SpellList {
    return SpellList.fromProps({
      id: doc._id.toString(),
      realm: doc.realm,
      type: doc.type,
      professionId: doc.professionId,
      accessType: doc.accessType,
      name: doc.name,
      description: doc.description,
      imageUrl: doc.imageUrl,
      owner: doc.owner,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}

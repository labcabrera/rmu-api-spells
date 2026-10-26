import { Injectable } from '@nestjs/common';
import { SpellListModel, type SpellListDocument } from '../persistence/models/spell-list.model.js';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RsqlParser } from '../../../shared/infrastructure/db/rsql-parser.js';
import type { SpellListRepository } from '../../application/ports/spell-list-repository.port.js';
import { SpellList } from '../../domain/aggregates/spell-list.js';
import { MongoBaseRepository } from '../../../shared/infrastructure/db/mongo.base.repository.js';
import type { QueryCriteria } from '../../../shared/application/criteria/query-criteria.js';
import { MongoQueryCriteriaMapper } from '../../../shared/infrastructure/db/mongo-query-criteria.mapper.js';

@Injectable()
export class MongoSpellListRepository extends MongoBaseRepository<SpellList, SpellListModel> implements SpellListRepository {
  constructor(@InjectModel(SpellListModel.name) model: Model<SpellListModel>, rsqlParser: RsqlParser) {
    super(model, rsqlParser);
  }

  async findIds(filter: QueryCriteria): Promise<string[]> {
    const docs = await this.model.find(MongoQueryCriteriaMapper.toFilterQuery(filter), { _id: 1 }).lean();
    return docs.map(doc => String(doc._id));
  }

  async existsByOwnerAndName(owner: string, name: string, exceptId?: string): Promise<boolean> {
    const filter = exceptId === undefined ? { owner, name } : { owner, name, _id: { $ne: exceptId } };
    return (await this.model.exists(filter)) !== null;
  }

  protected mapToEntity(doc: SpellListDocument): SpellList {
    return SpellList.fromProps({
      id: doc._id.toString(),
      realms: doc.realms?.length ? doc.realms : doc.realm ? [doc.realm] : [],
      type: doc.type,
      code: doc.code ?? null,
      bookSection: doc.bookSection ?? null,
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

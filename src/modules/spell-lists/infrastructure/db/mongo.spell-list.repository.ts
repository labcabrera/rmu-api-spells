import { Injectable } from '@nestjs/common';
import { SpellListModel, SpellListDocument } from '../persistence/models/spell-list-model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { RsqlParser } from 'src/modules/shared/infrastructure/persistence/repositories/rsql-parser';
import { Page } from 'src/modules/shared/domain/entities/page';
import { NotFoundError } from 'src/modules/shared/domain/errors/errors';
import { SpellListRepository } from '../../application/ports/spell-list-repository';
import { SpellList } from '../../domain/aggregates/spell-list';

@Injectable()
export class MongoSpellListRepository implements SpellListRepository {
  constructor(
    @InjectModel(SpellListModel.name) private spellListModel: Model<SpellListDocument>,
    private rsqlParser: RsqlParser,
  ) {}

  async findById(id: string): Promise<SpellList | null> {
    const readed = await this.spellListModel.findById(id);
    return readed ? this.mapToEntity(readed) : null;
  }

  async findByRsql(rsql: string, page: number, size: number): Promise<Page<SpellList>> {
    const skip = page * size;
    const mongoQuery = this.rsqlParser.parse(rsql);
    const [spellListsDocs, totalElements] = await Promise.all([
      this.spellListModel.find(mongoQuery).skip(skip).limit(size).sort({ name: 1 }),
      this.spellListModel.countDocuments(mongoQuery),
    ]);
    const content = spellListsDocs.map((doc) => this.mapToEntity(doc));
    return new Page<SpellList>(content, page, size, totalElements);
  }

  async save(spellList: Partial<SpellList>): Promise<SpellList> {
    const model = new this.spellListModel({ ...spellList, _id: spellList.id });
    await model.save();
    return this.mapToEntity(model);
  }

  async update(id: string, request: Partial<SpellList>): Promise<SpellList> {
    const updatedSpellList = await this.spellListModel.findByIdAndUpdate(id, { $set: request }, { new: true });
    if (!updatedSpellList) {
      throw new NotFoundError('SpellList', id);
    }
    return this.mapToEntity(updatedSpellList);
  }

  async deleteById(id: string): Promise<SpellList | null> {
    const result = await this.spellListModel.findByIdAndDelete(id);
    return result ? this.mapToEntity(result) : null;
  }

  async existsById(id: string): Promise<boolean> {
    const exists = await this.spellListModel.exists({ _id: id });
    return exists !== null;
  }

  private mapToEntity(doc: SpellListDocument): SpellList {
    return SpellList.fromProps({
      id: doc._id.toString(),
      realm: doc.realm,
      type: doc.type,
      professionId: doc.professionId,
      name: doc.name,
      description: doc.description,
      imageUrl: doc.imageUrl,
      owner: doc.owner,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}

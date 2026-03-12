import { Injectable } from '@nestjs/common';
import { SpellDocument, SpellModel } from '../persistence/models/spell.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { RsqlParser } from 'src/modules/shared/infrastructure/persistence/repositories/rsql-parser';
import { Page, Sort } from 'src/modules/shared/domain/entities/page';
import { NotFoundError } from 'src/modules/shared/domain/errors/errors';
import { SpellRepository } from '../../application/ports/spell-list-repository';
import { Spell } from '../../domain/aggregates/spell';

@Injectable()
export class MongoSpellRepository implements SpellRepository {
  constructor(
    @InjectModel(SpellModel.name) private realmModel: Model<SpellDocument>,
    private rsqlParser: RsqlParser,
  ) {}

  async findById(id: string): Promise<Spell | null> {
    const readed = await this.realmModel.findById(id);
    return readed ? this.mapToEntity(readed) : null;
  }

  async findByRsql(rsql: string, page: number, size: number, sort?: Sort): Promise<Page<Spell>> {
    const skip = page * size;
    const field: string = sort && sort.field ? (sort.field === 'id' ? '_id' : sort.field) : 'name';
    const direction: 1 | -1 = sort && sort.direction ? (String(sort.direction).toLowerCase() === 'desc' ? -1 : 1) : 1;
    const sortOption = { [field]: direction };
    const mongoQuery = this.rsqlParser.parse(rsql);
    const [realmsDocs, totalElements] = await Promise.all([
      this.realmModel.find(mongoQuery).skip(skip).limit(size).sort(sortOption),
      this.realmModel.countDocuments(mongoQuery),
    ]);
    const content = realmsDocs.map((doc) => this.mapToEntity(doc));
    return new Page<Spell>(content, page, size, totalElements);
  }

  async save(spell: Partial<Spell>): Promise<Spell> {
    const model = new this.realmModel({ ...spell, _id: spell.id });
    await model.save();
    return this.mapToEntity(model);
  }

  async update(id: string, request: Partial<Spell>): Promise<Spell> {
    const updatedSpell = await this.realmModel.findByIdAndUpdate(id, { $set: request }, { new: true });
    if (!updatedSpell) {
      throw new NotFoundError('Spell', id);
    }
    return this.mapToEntity(updatedSpell);
  }

  async deleteById(id: string): Promise<Spell | null> {
    const result = await this.realmModel.findByIdAndDelete(id);
    return result ? this.mapToEntity(result) : null;
  }

  async existsById(id: string): Promise<boolean> {
    const exists = await this.realmModel.exists({ _id: id });
    return exists !== null;
  }

  private mapToEntity(doc: SpellDocument): Spell {
    return Spell.fromProps({
      id: doc.id,
      spellListId: doc.spellListId,
      name: doc.name,
      level: doc.level,
      modifiers: doc.modifiers,
      description: doc.description,
      imageUrl: doc.imageUrl,
      owner: doc.owner,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}

import { Injectable } from '@nestjs/common';
import { SpellDocument, SpellModel } from '../persistence/models/spell.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { RsqlParser } from 'src/modules/shared/infrastructure/persistence/repositories/rsql-parser';
import { SpellRepository } from '../../application/ports/spell-list-repository';
import { Spell } from '../../domain/aggregates/spell';
import { MongoBaseRepository } from 'src/modules/shared/infrastructure/db/mongo.base.repository';

@Injectable()
export class MongoSpellRepository extends MongoBaseRepository<Spell, SpellDocument> implements SpellRepository {
  constructor(@InjectModel(SpellModel.name) realmModel: Model<SpellDocument>, rsqlParser: RsqlParser) {
    super(realmModel, rsqlParser);
  }

  protected mapToEntity(doc: SpellDocument): Spell {
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

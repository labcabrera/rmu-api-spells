import { Injectable } from '@nestjs/common';
import { SpellDocument, SpellModel } from '../persistence/models/spell.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RsqlParser } from '../../../shared/infrastructure/db/rsql-parser';
import { SpellRepository } from '../../application/ports/spell-repository.port';
import type { SpellModifiers } from '../../domain/value-objects/spell-modifiers.vo';
import { Spell } from '../../domain/aggregates/spell';
import { MongoBaseRepository } from '../../../shared/infrastructure/db/mongo.base.repository';

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
      modifiers: doc.modifiers as SpellModifiers,
      accessType: doc.accessType,
      description: doc.description,
      imageUrl: doc.imageUrl,
      owner: doc.owner,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}

import { SpellModifiers } from '../../domain/value-objects/spell-modifiers.vo.js';
import type { SpellEffect } from '../../domain/value-objects/spell-effect.vo.js';
import { Injectable } from '@nestjs/common';
import { type SpellDocument, SpellModel } from '../persistence/models/spell.model.js';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RsqlParser } from '../../../shared/infrastructure/db/rsql-parser.js';
import type { SpellRepository } from '../../application/ports/spell-repository.port.js';
import { Spell } from '../../domain/aggregates/spell.js';
import { MongoBaseRepository } from '../../../shared/infrastructure/db/mongo.base.repository.js';

@Injectable()
export class MongoSpellRepository extends MongoBaseRepository<Spell, SpellModel> implements SpellRepository {
  constructor(@InjectModel(SpellModel.name) model: Model<SpellModel>, rsqlParser: RsqlParser) {
    super(model, rsqlParser);
  }

  protected mapToEntity(doc: SpellDocument): Spell {
    return Spell.fromProps({
      id: doc.id,
      spellListId: doc.spellListId,
      name: doc.name,
      level: doc.level,
      modifiers: SpellModifiers.fromPlain(doc.modifiers),
      basedOn: doc.basedOn ?? null,
      effects: (doc.effects ?? []) as SpellEffect[],
      accessType: doc.accessType,
      description: doc.description,
      imageUrl: doc.imageUrl,
      owner: doc.owner,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}

import { Injectable } from '@nestjs/common';
import { type SpellDocument, SpellModel } from '../persistence/models/spell.model.js';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RsqlParser } from '../../../shared/infrastructure/db/rsql-parser.js';
import type { SpellRepository } from '../../application/ports/spell-repository.port.js';
import { SpellModifiers } from '../../domain/value-objects/spell-modifiers.vo.js';
import { SpellRange } from '../../domain/value-objects/spell-range.vo.js';
import { SpellDuration } from '../../domain/value-objects/spell-duration.vo.js';
import { SpellTarget } from '../../domain/value-objects/spell-target.vo.js';
import type { SpellModifiers as SpellModifiersModel } from '../persistence/models/spell-modifiers.model.js';
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
      modifiers: toModifiers(doc.modifiers),
      accessType: doc.accessType,
      description: doc.description,
      imageUrl: doc.imageUrl,
      owner: doc.owner,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}

/**
 * The value objects of the stored modifiers. Spells stored without modifiers, or with some of their fields missing,
 * are read with those fields empty (F-spells-06, spec 021 decision 5): no migration.
 */
function toModifiers(doc: SpellModifiersModel | null | undefined): SpellModifiers {
  if (!doc) return SpellModifiers.empty();
  const { range, duration, target } = doc;
  return new SpellModifiers(
    doc.type ?? null,
    doc.subtype ?? null,
    range ? new SpellRange(range.type, range.value ?? null) : null,
    duration
      ? new SpellDuration(
          duration.type ?? null,
          duration.duration ?? null,
          duration.durationScale ?? null,
          duration.requiredConcentration ?? null,
          duration.failureScale ?? null,
        )
      : null,
    target ? new SpellTarget(target.mode, target.types ? [...target.types] : null, target.count ?? null, target.modifier ?? null) : null,
    doc.rrModifier ?? null,
    doc.instant ?? null,
    doc.notRequiredPowerPoints ?? null,
    doc.partOfSetOfSpells ?? null,
  );
}

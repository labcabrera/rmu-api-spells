import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import type { SpellListContentsPort } from '../../application/ports/spell-list-contents.port.js';
import type { EntitySource } from '../../../shared/domain/entities/entity-source.js';

/** Counts in the spells collection directly: the spells module imports this one, so it cannot be imported back. */
@Injectable()
export class MongoSpellListContentsAdapter implements SpellListContentsPort {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async countSpells(spellListId: string): Promise<number> {
    return this.connection.collection('spells').countDocuments({ spellListId });
  }

  async setEntitySourceByList(spellListId: string, entitySource: EntitySource): Promise<void> {
    // A new version, so a copy of a spell read before this write cannot store the old source back.
    await this.connection.collection('spells').updateMany({ spellListId }, { $set: { entitySource }, $inc: { version: 1 } });
  }
}

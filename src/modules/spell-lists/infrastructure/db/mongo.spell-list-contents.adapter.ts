import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import type { SpellListContentsPort } from '../../application/ports/spell-list-contents.port.js';

/** Counts in the spells collection directly: the spells module imports this one, so it cannot be imported back. */
@Injectable()
export class MongoSpellListContentsAdapter implements SpellListContentsPort {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async countSpells(spellListId: string): Promise<number> {
    return this.connection.collection('spells').countDocuments({ spellListId });
  }
}

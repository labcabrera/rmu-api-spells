import { Injectable } from '@nestjs/common';
import { ForbiddenError } from 'src/modules/shared/domain/errors/errors';
import { SpellListGuardPort } from '../../application/ports/spell-list-guard.port';
import { SpellList } from '../../domain/aggregates/spell-list';

@Injectable()
export class SpellListGuardAdapter implements SpellListGuardPort {
  checkCreateSpellList(roles: string[]) {
    if (!roles.includes('rmu-admin')) {
      throw new ForbiddenError('You do not have permission to create a spell list');
    }
  }
  checkUpdateSpellList(spellList: SpellList, userId: string, roles: string[]) {
    if (roles.includes('rmu-admin')) return;
    if (spellList.owner === userId) return;
    throw new ForbiddenError('You do not have permission to update this spell list');
  }
}

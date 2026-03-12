import { Injectable } from '@nestjs/common';
import { ForbiddenError } from 'src/modules/shared/domain/errors/errors';
import { SpellGuardPort } from '../../application/ports/spell-guard.port';
import { Spell } from '../../domain/aggregates/spell';

@Injectable()
export class SpellGuardAdapter implements SpellGuardPort {
  checkCreate(roles: string[]) {
    if (!roles.includes('rmu-admin')) {
      throw new ForbiddenError('You do not have permission to create a spell');
    }
  }
  checkUpdate(spell: Spell, userId: string, roles: string[]) {
    if (roles.includes('rmu-admin')) return;
    if (spell.owner === userId) return;
    throw new ForbiddenError('You do not have permission to update this spell');
  }
}

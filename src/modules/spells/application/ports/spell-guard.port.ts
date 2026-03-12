import { Spell } from '../../domain/aggregates/spell';

export interface SpellGuardPort {
  checkCreate(roles: string[]);
  checkUpdate(spell: Spell, userId: string, roles: string[]);
}

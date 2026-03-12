import { SpellList } from '../../domain/aggregates/spell-list';

export interface SpellListGuardPort {
  checkCreate(roles: string[]);
  checkUpdate(spellList: SpellList, userId: string, roles: string[]);
}

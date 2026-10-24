import { EntityGuard } from '../../../shared/application/ports/entity-guard.port';
import { SpellList } from '../../domain/aggregates/spell-list';

export type SpellListGuardPort = EntityGuard<SpellList>;

export const SPELL_LIST_GUARD_PORT = Symbol('SpellListGuardPort');

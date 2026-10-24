import type { EntityGuard } from '../../../shared/application/ports/entity-guard.port.js';
import { SpellList } from '../../domain/aggregates/spell-list.js';

export type SpellListGuardPort = EntityGuard<SpellList>;

export const SPELL_LIST_GUARD_PORT = Symbol('SpellListGuardPort');

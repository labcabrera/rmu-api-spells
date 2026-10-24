import type { EntityGuard } from '../../../shared/application/ports/entity-guard.port.js';
import { Spell } from '../../domain/aggregates/spell.js';

export type SpellGuardPort = EntityGuard<Spell>;

export const SPELL_GUARD_PORT = Symbol('SpellGuardPort');

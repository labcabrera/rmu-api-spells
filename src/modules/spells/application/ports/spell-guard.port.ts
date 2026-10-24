import { EntityGuard } from '../../../shared/application/ports/entity-guard.port';
import { Spell } from '../../domain/aggregates/spell';

export type SpellGuardPort = EntityGuard<Spell>;

export const SPELL_GUARD_PORT = Symbol('SpellGuardPort');

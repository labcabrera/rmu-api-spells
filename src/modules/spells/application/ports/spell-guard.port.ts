import { EntityGuard } from 'src/modules/shared/application/ports/entity-guard';
import { Spell } from '../../domain/aggregates/spell';

export type SpellGuardPort = EntityGuard<Spell>;

import { EntityGuard } from 'src/modules/shared/application/ports/entity-guard';
import { SpellList } from '../../domain/aggregates/spell-list';

export type SpellListGuardPort = EntityGuard<SpellList>;

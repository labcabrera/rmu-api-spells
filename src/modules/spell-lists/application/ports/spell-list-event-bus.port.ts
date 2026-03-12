import { DomainEvent } from 'src/modules/shared/domain/events/domain-event';
import { SpellListProps } from '../../domain/aggregates/spell-list';

export interface SpellListEventBusPort {
  publish(event: DomainEvent<SpellListProps>): void;
}

import { DomainEvent } from 'src/modules/shared/domain/events/domain-event';
import { SpellProps } from '../../domain/aggregates/spell.props';

export interface SpellEventBusPort {
  publish(event: DomainEvent<SpellProps>): void;
}

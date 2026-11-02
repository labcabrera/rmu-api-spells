import { DomainEvent } from '../../../shared/domain/events/domain-event.js';
import { SpellProps } from '../aggregates/spell.props.js';

export class SpellUpdatedEvent extends DomainEvent<SpellProps> {
  constructor(data: SpellProps) {
    super('updated', data);
  }
}

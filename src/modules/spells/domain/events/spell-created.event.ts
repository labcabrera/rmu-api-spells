import { DomainEvent } from '../../../shared/domain/events/domain-event.js';
import { SpellProps } from '../aggregates/spell.props.js';

export class SpellCreatedEvent extends DomainEvent<SpellProps> {
  constructor(data: SpellProps) {
    super('created', data);
  }
}

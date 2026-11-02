import { DomainEvent } from '../../../shared/domain/events/domain-event.js';
import { SpellListProps } from '../aggregates/spell-list.props.js';

export class SpellListUpdatedEvent extends DomainEvent<SpellListProps> {
  constructor(data: SpellListProps) {
    super('updated', data);
  }
}

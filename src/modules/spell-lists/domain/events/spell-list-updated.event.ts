import { DomainEvent } from '../../../shared/domain/events/domain-event';
import { SpellListProps } from '../aggregates/spell-list.props';

export class SpellListUpdatedEvent extends DomainEvent<SpellListProps> {
  constructor(data: SpellListProps) {
    super('updated', data);
  }
}

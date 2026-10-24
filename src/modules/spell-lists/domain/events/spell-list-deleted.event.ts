import { DomainEvent } from '../../../shared/domain/events/domain-event';
import { SpellListProps } from '../aggregates/spell-list.props';

export class SpellListDeletedEvent extends DomainEvent<SpellListProps> {
  constructor(data: SpellListProps) {
    super('deleted', data);
  }
}

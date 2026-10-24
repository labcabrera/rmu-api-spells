import { DomainEvent } from '../../../shared/domain/events/domain-event.js';
import { SpellListProps } from '../aggregates/spell-list.props.js';

export class SpellListDeletedEvent extends DomainEvent<SpellListProps> {
  constructor(data: SpellListProps) {
    super('deleted', data);
  }
}

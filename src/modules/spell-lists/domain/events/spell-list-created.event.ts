import { DomainEvent } from 'src/modules/shared/domain/events/domain-event';
import { SpellListProps } from '../aggregates/spell-list.props';

export class SpellListCreatedEvent extends DomainEvent<SpellListProps> {
  constructor(data: SpellListProps) {
    super('created', data);
  }
}

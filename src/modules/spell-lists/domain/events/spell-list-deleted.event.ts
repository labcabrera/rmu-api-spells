import { DomainEvent } from 'src/modules/shared/domain/events/domain-event';
import { SpellListProps } from '../aggregates/spell-list';

export class SpellListDeletedEvent extends DomainEvent<SpellListProps> {
  constructor(data: SpellListProps) {
    super('deleted', data);
  }
}

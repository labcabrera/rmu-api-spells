import { DomainEvent } from 'src/modules/shared/domain/events/domain-event';
import { SpellProps } from '../aggregates/spell.props';

export class SpellCreatedEvent extends DomainEvent<SpellProps> {
  constructor(data: SpellProps) {
    super('created', data);
  }
}

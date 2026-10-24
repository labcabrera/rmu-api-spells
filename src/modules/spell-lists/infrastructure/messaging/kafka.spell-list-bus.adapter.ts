import { Injectable, Logger } from '@nestjs/common';
import { SpellList } from '../../domain/aggregates/spell-list';
import { DomainEvent } from '../../../shared/domain/events/domain-event';
import { KafkaProducerService } from '../../../shared/infrastructure/messaging/kafka-producer.service';

@Injectable()
export class KafkaSpellListProducerService {
  private readonly logger = new Logger(KafkaSpellListProducerService.name);

  constructor(private readonly kafkaProducerService: KafkaProducerService) {}

  publish(event: DomainEvent<SpellList>): void {
    this.kafkaProducerService.emit(`internal.rmu-spells.spell-list.${event.eventType}.v1`, event).catch(err => {
      //TODO handle error properly
      this.logger.error('Error publishing event to Kafka', err);
    });
  }
}

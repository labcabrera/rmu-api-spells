import { Injectable, Logger } from '@nestjs/common';
import { DomainEvent } from '../../../shared/domain/events/domain-event';
import { KafkaProducerService } from '../../../shared/infrastructure/messaging/kafka-producer.service';
import { Spell } from '../../domain/aggregates/spell';

@Injectable()
export class KafkaSpellListProducerService {
  private readonly logger = new Logger(KafkaSpellListProducerService.name);

  constructor(private readonly kafkaProducerService: KafkaProducerService) {}

  publish(event: DomainEvent<Spell>): void {
    this.kafkaProducerService.emit(`internal.rmu-spells.spell.${event.eventType}.v1`, event).catch(err => {
      //TODO handle error properly
      this.logger.error('Error publishing event to Kafka', err);
    });
  }
}

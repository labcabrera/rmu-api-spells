import { Injectable, Logger } from '@nestjs/common';
import { SpellList } from '../../domain/aggregates/spell-list';
import { DomainEvent } from 'src/modules/shared/domain/events/domain-event';
import { KafkaProducerService } from 'src/modules/shared/infrastructure/messaging/kafka-producer.service';

@Injectable()
export class KafkaSpellListProducerService {
  private readonly logger = new Logger(KafkaSpellListProducerService.name);

  constructor(private readonly kafkaProducerService: KafkaProducerService) {}

  publish(event: DomainEvent<SpellList>): void {
    this.kafkaProducerService.emit(`internal.rmu-core.spell-list.${event.eventType}.v1`, event).catch((err) => {
      //TODO handle error properly
      this.logger.error('Error publishing event to Kafka', err);
    });
  }
}

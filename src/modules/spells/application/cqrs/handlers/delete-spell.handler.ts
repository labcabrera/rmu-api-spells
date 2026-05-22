import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteSpellCommand } from '../commands/delete-spell.command';
import { NotFoundError } from 'src/modules/shared/domain/errors/errors';
import type { SpellEventBusPort } from '../../ports/spell-event-bus.port';
import type { SpellRepository } from '../../ports/spell-list-repository';
import { SpellDeletedEvent } from 'src/modules/spells/domain/events/spell-deleted.event';
import type { SpellGuardPort } from '../../ports/spell-guard.port';

@CommandHandler(DeleteSpellCommand)
export class DeleteSpellHandler implements ICommandHandler<DeleteSpellCommand> {
  private readonly logger = new Logger(DeleteSpellHandler.name);

  constructor(
    @Inject('SpellRepository') private readonly spellRepository: SpellRepository,
    @Inject('SpellGuardPort') private readonly spellGuard: SpellGuardPort,
    @Inject('SpellEventProducer') private readonly spellEventBus: SpellEventBusPort,
  ) {}

  async execute(command: DeleteSpellCommand): Promise<void> {
    this.logger.log(`Deleting spell ${command.spellId}`);
    const spell = await this.spellRepository.findById(command.spellId);
    if (!spell) throw new NotFoundError('Spell', command.spellId);
    this.spellGuard.checkDelete(spell, command.userId, command.roles);

    const deleted = await this.spellRepository.deleteById(command.spellId);
    if (!deleted) {
      throw new NotFoundError('Spell', command.spellId);
    }
    this.spellEventBus.publish(new SpellDeletedEvent(deleted.getProps()));
  }
}

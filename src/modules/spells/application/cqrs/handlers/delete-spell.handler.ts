import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteSpellCommand } from '../commands/delete-spell.command';
import { NotFoundError } from '../../../../shared/domain/errors/errors';
import { type SpellRepository, SPELL_REPOSITORY } from '../../ports/spell-repository.port';
import { SpellDeletedEvent } from '../../../domain/events/spell-deleted.event';
import { type SpellGuardPort, SPELL_GUARD_PORT } from '../../ports/spell-guard.port';
import { DOMAIN_EVENT_PUBLISHER, type DomainEventPublisher } from '../../../../shared/application/ports/domain-event-publisher.port';

@CommandHandler(DeleteSpellCommand)
export class DeleteSpellHandler implements ICommandHandler<DeleteSpellCommand> {
  private readonly logger = new Logger(DeleteSpellHandler.name);

  constructor(
    @Inject(SPELL_REPOSITORY) private readonly spellRepository: SpellRepository,
    @Inject(SPELL_GUARD_PORT) private readonly spellGuard: SpellGuardPort,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly events: DomainEventPublisher,
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
    await this.events.publish('spell', new SpellDeletedEvent(deleted.getProps()));
  }
}

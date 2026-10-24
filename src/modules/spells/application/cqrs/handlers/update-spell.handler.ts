import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateSpellCommand } from '../commands/update-spell.command';
import { NotFoundError } from '../../../../shared/domain/errors/errors';
import { Spell } from '../../../domain/aggregates/spell';
import { type SpellRepository, SPELL_REPOSITORY } from '../../ports/spell-repository.port';
import { type SpellGuardPort, SPELL_GUARD_PORT } from '../../ports/spell-guard.port';
import { DOMAIN_EVENT_PUBLISHER, type DomainEventPublisher } from '../../../../shared/application/ports/domain-event-publisher.port';

@CommandHandler(UpdateSpellCommand)
export class UpdateSpellHandler implements ICommandHandler<UpdateSpellCommand, Spell> {
  constructor(
    @Inject(SPELL_REPOSITORY) private readonly spellRepository: SpellRepository,
    @Inject(SPELL_GUARD_PORT) private readonly spellGuard: SpellGuardPort,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly events: DomainEventPublisher,
  ) {}

  async execute(command: UpdateSpellCommand): Promise<Spell> {
    const spell = await this.spellRepository.findById(command.id);
    if (!spell) throw new NotFoundError('Spell', command.id);

    this.spellGuard.checkUpdate(spell, command.userId, command.roles);

    spell.update({
      name: command.name,
      level: command.level,
      modifiers: command.modifiers,
      accessType: command.accessType,
      description: command.description,
      imageUrl: command.imageUrl,
    });
    const updated = await this.spellRepository.update(spell.id, spell);
    await this.events.publishChanges('spell', spell);
    return updated;
  }
}

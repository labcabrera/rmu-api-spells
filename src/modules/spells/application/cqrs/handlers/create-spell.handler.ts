import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateSpellCommand } from '../commands/create-spell.command';
import { type SpellRepository, SPELL_REPOSITORY } from '../../ports/spell-repository.port';
import { Spell } from '../../../domain/aggregates/spell';
import { type SpellGuardPort, SPELL_GUARD_PORT } from '../../ports/spell-guard.port';
import { DOMAIN_EVENT_PUBLISHER, type DomainEventPublisher } from '../../../../shared/application/ports/domain-event-publisher.port';

@CommandHandler(CreateSpellCommand)
export class CreateSpellHandler implements ICommandHandler<CreateSpellCommand, Spell> {
  private readonly logger = new Logger(CreateSpellHandler.name);

  constructor(
    @Inject(SPELL_REPOSITORY) private readonly spellRepository: SpellRepository,
    @Inject(SPELL_GUARD_PORT) private readonly spellGuard: SpellGuardPort,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly events: DomainEventPublisher,
  ) {}

  async execute(command: CreateSpellCommand): Promise<Spell> {
    this.logger.log(`Creating spell ${command.name} for user ${command.userId}`);
    this.spellGuard.checkCreate(command.roles);
    const spell = Spell.create({
      spellListId: command.spellListId,
      name: command.name,
      level: command.level,
      modifiers: command.modifiers,
      accessType: command.accessType,
      description: command.description,
      imageUrl: command.imageUrl,
      owner: command.userId,
    });
    const savedSpell = await this.spellRepository.save(spell);
    await this.events.publishChanges('spell', spell);
    return savedSpell;
  }
}

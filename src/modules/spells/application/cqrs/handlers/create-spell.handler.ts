import { Inject, Logger } from '@nestjs/common';
import { type SpellListRepository, SPELL_LIST_REPOSITORY } from '../../../../spell-lists/application/ports/spell-list-repository.port.js';
import { NotFoundError } from '../../../../shared/domain/errors/errors.js';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { CreateSpellCommand } from '../commands/create-spell.command.js';
import { type SpellRepository, SPELL_REPOSITORY } from '../../ports/spell-repository.port.js';
import { Spell } from '../../../domain/aggregates/spell.js';
import { type SpellGuardPort, SPELL_GUARD_PORT } from '../../ports/spell-guard.port.js';
import { DOMAIN_EVENT_PUBLISHER, type DomainEventPublisher } from '../../../../shared/application/ports/domain-event-publisher.port.js';

@CommandHandler(CreateSpellCommand)
export class CreateSpellHandler implements ICommandHandler<CreateSpellCommand, Spell> {
  private readonly logger = new Logger(CreateSpellHandler.name);

  constructor(
    @Inject(SPELL_REPOSITORY) private readonly spellRepository: SpellRepository,
    @Inject(SPELL_LIST_REPOSITORY) private readonly spellListRepository: SpellListRepository,
    @Inject(SPELL_GUARD_PORT) private readonly spellGuard: SpellGuardPort,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly events: DomainEventPublisher,
  ) {}

  async execute(command: CreateSpellCommand): Promise<Spell> {
    this.logger.log(`Creating spell ${command.name} for user ${command.userId}`);
    const list = await this.spellListRepository.findById(command.spellListId);
    if (!list) throw new NotFoundError('SpellList', command.spellListId);
    this.spellGuard.checkCreate(list, command.userId, command.roles);
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

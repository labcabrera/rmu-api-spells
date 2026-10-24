import { Inject } from '@nestjs/common';
import { type SpellListRepository, SPELL_LIST_REPOSITORY } from '../../../../spell-lists/application/ports/spell-list-repository.port.js';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { UpdateSpellCommand } from '../commands/update-spell.command.js';
import { NotFoundError } from '../../../../shared/domain/errors/errors.js';
import { Spell } from '../../../domain/aggregates/spell.js';
import { type SpellRepository, SPELL_REPOSITORY } from '../../ports/spell-repository.port.js';
import { type SpellGuardPort, SPELL_GUARD_PORT } from '../../ports/spell-guard.port.js';
import { DOMAIN_EVENT_PUBLISHER, type DomainEventPublisher } from '../../../../shared/application/ports/domain-event-publisher.port.js';

@CommandHandler(UpdateSpellCommand)
export class UpdateSpellHandler implements ICommandHandler<UpdateSpellCommand, Spell> {
  constructor(
    @Inject(SPELL_REPOSITORY) private readonly spellRepository: SpellRepository,
    @Inject(SPELL_LIST_REPOSITORY) private readonly spellListRepository: SpellListRepository,
    @Inject(SPELL_GUARD_PORT) private readonly spellGuard: SpellGuardPort,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly events: DomainEventPublisher,
  ) {}

  async execute(command: UpdateSpellCommand): Promise<Spell> {
    const spell = await this.spellRepository.findById(command.id);
    if (!spell) throw new NotFoundError('Spell', command.id);

    const list = await this.spellListRepository.findById(spell.spellListId);
    this.spellGuard.checkUpdate(spell, list, command.userId, command.roles);
    spell.checkVersion(command.expectedVersion);

    // Moving the spell (F-spells-20): the user adds it to the other list, which must exist and be theirs.
    if (command.spellListId !== undefined && command.spellListId !== spell.spellListId) {
      const target = await this.spellListRepository.findById(command.spellListId);
      if (!target) throw new NotFoundError('SpellList', command.spellListId);
      this.spellGuard.checkCreate(target, command.userId, command.roles);
    }

    spell.update({
      spellListId: command.spellListId,
      name: command.name,
      level: command.level,
      modifiers: command.modifiers,
      accessType: command.accessType,
      description: command.description,
      imageUrl: command.imageUrl,
    });
    if (!spell.hasChanges()) return spell;
    const updated = await this.spellRepository.update(spell);
    await this.events.publishChanges('spell', spell);
    return updated;
  }
}

import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { DeleteSpellListCommand } from '../commands/delete-spell-list.command.js';
import { ConflictError, NotFoundError } from '../../../../shared/domain/errors/errors.js';
import { SpellListDeletedEvent } from '../../../domain/events/spell-list-deleted.event.js';
import { type SpellListRepository, SPELL_LIST_REPOSITORY } from '../../ports/spell-list-repository.port.js';
import { type SpellListGuardPort, SPELL_LIST_GUARD_PORT } from '../../ports/spell-list-guard.port.js';
import { type SpellListContentsPort, SPELL_LIST_CONTENTS_PORT } from '../../ports/spell-list-contents.port.js';
import { DOMAIN_EVENT_PUBLISHER, type DomainEventPublisher } from '../../../../shared/application/ports/domain-event-publisher.port.js';

@CommandHandler(DeleteSpellListCommand)
export class DeleteSpellListHandler implements ICommandHandler<DeleteSpellListCommand> {
  private readonly logger = new Logger(DeleteSpellListHandler.name);

  constructor(
    @Inject(SPELL_LIST_REPOSITORY) private readonly spellListRepository: SpellListRepository,
    @Inject(SPELL_LIST_GUARD_PORT) private readonly spellListGuard: SpellListGuardPort,
    @Inject(SPELL_LIST_CONTENTS_PORT) private readonly contents: SpellListContentsPort,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly events: DomainEventPublisher,
  ) {}

  async execute(command: DeleteSpellListCommand): Promise<void> {
    this.logger.log(`Deleting spell list ${command.id}`);
    const spellList = await this.spellListRepository.findById(command.id);
    if (!spellList) throw new NotFoundError('SpellList', command.id);
    this.spellListGuard.checkDelete(spellList, command.userId, command.roles);
    // A list with spells is not deleted: they would point to a list that does not exist (F-spells-15).
    const spells = await this.contents.countSpells(command.id);
    if (spells > 0) throw new ConflictError(`Spell list ${command.id} still has ${spells} spells`, 'has-spells');
    await this.spellListRepository.deleteById(command.id);
    await this.events.publish('spell-list', new SpellListDeletedEvent(spellList.getProps()));
  }
}

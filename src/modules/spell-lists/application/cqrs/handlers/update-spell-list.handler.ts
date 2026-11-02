import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { SpellList } from '../../../domain/aggregates/spell-list.js';
import { UpdateSpellListCommand } from '../commands/update-spell-list.command.js';
import { ConflictError, NotFoundError } from '../../../../shared/domain/errors/errors.js';
import { type SpellListRepository, SPELL_LIST_REPOSITORY } from '../../ports/spell-list-repository.port.js';
import { type SpellListGuardPort, SPELL_LIST_GUARD_PORT } from '../../ports/spell-list-guard.port.js';
import { type SpellListContentsPort, SPELL_LIST_CONTENTS_PORT } from '../../ports/spell-list-contents.port.js';
import { DOMAIN_EVENT_PUBLISHER, type DomainEventPublisher } from '../../../../shared/application/ports/domain-event-publisher.port.js';

@CommandHandler(UpdateSpellListCommand)
export class UpdateSpellListHandler implements ICommandHandler<UpdateSpellListCommand, SpellList> {
  constructor(
    @Inject(SPELL_LIST_REPOSITORY) private readonly spellListRepository: SpellListRepository,
    @Inject(SPELL_LIST_GUARD_PORT) private readonly spellListGuard: SpellListGuardPort,
    @Inject(SPELL_LIST_CONTENTS_PORT) private readonly contents: SpellListContentsPort,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly events: DomainEventPublisher,
  ) {}

  async execute(command: UpdateSpellListCommand): Promise<SpellList> {
    const spellList = await this.spellListRepository.findById(command.id);
    if (!spellList) throw new NotFoundError('SpellList', command.id);
    this.spellListGuard.checkUpdate(spellList, command.userId, command.roles);
    // Spec 063: after checkUpdate, only an admin asks for `system`; the owner never changes.
    this.spellListGuard.checkEntitySource(command.roles, command.entitySource);
    spellList.checkVersion(command.expectedVersion);
    const previousSource = spellList.entitySource;
    spellList.update({
      name: command.name,
      realms: command.realms,
      type: command.type,
      code: command.code,
      bookSection: command.bookSection,
      professionId: command.professionId,
      accessType: command.accessType,
      description: command.description,
      imageUrl: command.imageUrl,
      entitySource: command.entitySource,
    });
    if (!spellList.hasChanges()) return spellList;
    if (
      command.name !== undefined &&
      (await this.spellListRepository.existsByOwnerAndName(spellList.owner, spellList.name, spellList.id))
    ) {
      throw new ConflictError('Name already in use', 'name-in-use');
    }
    const updated = await this.spellListRepository.update(spellList);
    // The spells of a list take its source (spec 063).
    if (updated.entitySource !== previousSource) await this.contents.setEntitySourceByList(updated.id, updated.entitySource);
    await this.events.publishChanges('spell-list', spellList);
    return updated;
  }
}

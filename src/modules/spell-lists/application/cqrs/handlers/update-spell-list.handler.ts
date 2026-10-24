import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { SpellList } from '../../../domain/aggregates/spell-list.js';
import { UpdateSpellListCommand } from '../commands/update-spell-list.command.js';
import { NotFoundError } from '../../../../shared/domain/errors/errors.js';
import { type SpellListRepository, SPELL_LIST_REPOSITORY } from '../../ports/spell-list-repository.port.js';
import { type SpellListGuardPort, SPELL_LIST_GUARD_PORT } from '../../ports/spell-list-guard.port.js';
import { DOMAIN_EVENT_PUBLISHER, type DomainEventPublisher } from '../../../../shared/application/ports/domain-event-publisher.port.js';

@CommandHandler(UpdateSpellListCommand)
export class UpdateSpellListHandler implements ICommandHandler<UpdateSpellListCommand, SpellList> {
  constructor(
    @Inject(SPELL_LIST_REPOSITORY) private readonly spellListRepository: SpellListRepository,
    @Inject(SPELL_LIST_GUARD_PORT) private readonly spellListGuard: SpellListGuardPort,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly events: DomainEventPublisher,
  ) {}

  async execute(command: UpdateSpellListCommand): Promise<SpellList> {
    const spellList = await this.spellListRepository.findById(command.id);
    if (!spellList) throw new NotFoundError('SpellList', command.id);
    this.spellListGuard.checkUpdate(spellList, command.userId, command.roles);
    spellList.checkVersion(command.expectedVersion);
    spellList.update({
      name: command.name,
      realm: command.realm,
      type: command.type,
      professionId: command.professionId,
      accessType: command.accessType,
      description: command.description,
      imageUrl: command.imageUrl,
    });
    if (!spellList.hasChanges()) return spellList;
    const updated = await this.spellListRepository.update(spellList);
    await this.events.publishChanges('spell-list', spellList);
    return updated;
  }
}

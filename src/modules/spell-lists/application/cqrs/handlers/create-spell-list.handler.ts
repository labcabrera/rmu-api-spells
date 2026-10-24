import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { SpellList } from '../../../domain/aggregates/spell-list.js';
import { CreateSpellListCommand } from '../commands/create-spell-list.command.js';
import { type SpellListGuardPort, SPELL_LIST_GUARD_PORT } from '../../ports/spell-list-guard.port.js';
import { type SpellListRepository, SPELL_LIST_REPOSITORY } from '../../ports/spell-list-repository.port.js';
import { ConflictError } from '../../../../shared/domain/errors/errors.js';
import { DOMAIN_EVENT_PUBLISHER, type DomainEventPublisher } from '../../../../shared/application/ports/domain-event-publisher.port.js';

@CommandHandler(CreateSpellListCommand)
export class CreateSpellListHandler implements ICommandHandler<CreateSpellListCommand, SpellList> {
  private readonly logger = new Logger(CreateSpellListHandler.name);

  constructor(
    @Inject(SPELL_LIST_REPOSITORY) private readonly spellListRepository: SpellListRepository,
    @Inject(SPELL_LIST_GUARD_PORT) private readonly spellListGuard: SpellListGuardPort,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly events: DomainEventPublisher,
  ) {}

  async execute(command: CreateSpellListCommand): Promise<SpellList> {
    this.logger.log(`Creating spell list ${command.name} for user ${command.userId}`);
    this.spellListGuard.checkCreate(command.roles);

    // Unique per user (F-spells-16): a global check would reveal the names of the private lists of others.
    if (await this.spellListRepository.existsByOwnerAndName(command.userId, command.name)) {
      throw new ConflictError('Name already in use', 'name-in-use');
    }

    const spellList = SpellList.create({
      name: command.name,
      realm: command.realm,
      type: command.type,
      professionId: command.professionId,
      accessType: command.accessType,
      description: command.description,
      imageUrl: command.imageUrl,
      owner: command.userId,
    });
    const savedSpellList = await this.spellListRepository.save(spellList);
    await this.events.publishChanges('spell-list', spellList);
    return savedSpellList;
  }
}

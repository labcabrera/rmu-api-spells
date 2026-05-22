import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteSpellListCommand } from '../commands/delete-spell-list.command';
import { NotFoundError } from 'src/modules/shared/domain/errors/errors';
import { SpellListDeletedEvent } from 'src/modules/spell-lists/domain/events/spell-list-deleted.event';
import type { SpellListEventBusPort } from '../../ports/spell-list-event-bus.port';
import type { SpellListRepository } from '../../ports/spell-list-repository';
import type { SpellListGuardPort } from '../../ports/spell-list-guard.port';

@CommandHandler(DeleteSpellListCommand)
export class DeleteSpellListHandler implements ICommandHandler<DeleteSpellListCommand> {
  private readonly logger = new Logger(DeleteSpellListHandler.name);

  constructor(
    @Inject('SpellListRepository') private readonly spellListRepository: SpellListRepository,
    @Inject('SpellListGuardPort') private readonly spellListGuard: SpellListGuardPort,
    @Inject('SpellListEventProducer') private readonly spellListEventBus: SpellListEventBusPort,
  ) {}

  async execute(command: DeleteSpellListCommand): Promise<void> {
    this.logger.log(`Deleting spell list ${command.id}`);
    const spellList = await this.spellListRepository.findById(command.id);
    if (!spellList) throw new NotFoundError('SpellList', command.id);
    this.spellListGuard.checkDelete(spellList, command.userId, command.roles);
    await this.spellListRepository.deleteById(command.id);
    this.spellListEventBus.publish(new SpellListDeletedEvent(spellList.getProps()));
  }
}

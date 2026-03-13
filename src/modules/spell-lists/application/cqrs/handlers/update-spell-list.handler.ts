import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SpellList } from '../../../domain/aggregates/spell-list';
import { UpdateSpellListCommand } from '../commands/update-spell-list.command';
import { NotFoundError } from 'src/modules/shared/domain/errors/errors';
import type { SpellListRepository } from '../../ports/spell-list-repository';
import type { SpellListEventBusPort } from '../../ports/spell-list-event-bus.port';

@CommandHandler(UpdateSpellListCommand)
export class UpdateSpellListHandler implements ICommandHandler<UpdateSpellListCommand, SpellList> {
  constructor(
    @Inject('SpellListRepository') private readonly spellListRepository: SpellListRepository,
    @Inject('SpellListEventProducer') private readonly spellListEventBus: SpellListEventBusPort,
  ) {}

  async execute(command: UpdateSpellListCommand): Promise<SpellList> {
    const spellList = await this.spellListRepository.findById(command.id);
    if (!spellList) {
      throw new NotFoundError('SpellList', command.id);
    }
    spellList.update({
      name: command.name,
      realm: command.realm,
      type: command.type,
      professionId: command.professionId,
      description: command.description,
      imageUrl: command.imageUrl,
    });
    const updated = await this.spellListRepository.update(spellList.id, spellList);
    spellList.getUncommittedEvents().forEach((event) => this.spellListEventBus.publish(event));
    return updated;
  }
}

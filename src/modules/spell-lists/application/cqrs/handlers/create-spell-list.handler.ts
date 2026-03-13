import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SpellList } from '../../../domain/aggregates/spell-list';
import { CreateSpellListCommand } from '../commands/create-spell-list.command';
import type { SpellListGuardPort } from '../../ports/spell-list-guard.port';
import type { SpellListRepository } from '../../ports/spell-list-repository';
import type { SpellListEventBusPort } from '../../ports/spell-list-event-bus.port';

@CommandHandler(CreateSpellListCommand)
export class CreateSpellListHandler implements ICommandHandler<CreateSpellListCommand, SpellList> {
  private readonly logger = new Logger(CreateSpellListHandler.name);

  constructor(
    @Inject('SpellListRepository') private readonly spellListRepository: SpellListRepository,
    @Inject('SpellListGuardPort') private readonly spellListGuard: SpellListGuardPort,
    @Inject('SpellListEventProducer') private readonly spellListEventBus: SpellListEventBusPort,
  ) {}

  async execute(command: CreateSpellListCommand): Promise<SpellList> {
    this.logger.log(`Creating spell list ${command.name} for user ${command.userId}`);
    this.spellListGuard.checkCreate(command.roles);
    const spellList = SpellList.create({
      name: command.name,
      realm: command.realm,
      type: command.type,
      description: command.description,
      imageUrl: command.imageUrl,
      owner: command.userId,
    });
    const savedSpellList = await this.spellListRepository.save(spellList);
    spellList.getUncommittedEvents().forEach((event) => this.spellListEventBus.publish(event));
    return savedSpellList;
  }
}

import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateSpellCommand } from '../commands/create-spell.command';
import type { SpellRepository } from '../../ports/spell-list-repository';
import { Spell } from 'src/modules/spells/domain/aggregates/spell';
import type { SpellEventBusPort } from '../../ports/spell-event-bus.port';
import type { SpellGuardPort } from '../../ports/spell-guard.port';

@CommandHandler(CreateSpellCommand)
export class CreateSpellHandler implements ICommandHandler<CreateSpellCommand, Spell> {
  private readonly logger = new Logger(CreateSpellHandler.name);

  constructor(
    @Inject('SpellRepository') private readonly spellRepository: SpellRepository,
    @Inject('SpellGuardPort') private readonly spellGuard: SpellGuardPort,
    @Inject('SpellEventProducer') private readonly spellEventBus: SpellEventBusPort,
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
    spell.getUncommittedEvents().forEach((event) => this.spellEventBus.publish(event));
    return savedSpell;
  }
}

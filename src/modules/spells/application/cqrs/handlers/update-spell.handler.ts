import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateSpellCommand } from '../commands/update-spell.command';
import { NotFoundError } from 'src/modules/shared/domain/errors/errors';
import { Spell } from 'src/modules/spells/domain/aggregates/spell';
import type { SpellEventBusPort } from '../../ports/spell-event-bus.port';
import type { SpellRepository } from '../../ports/spell-list-repository';

@CommandHandler(UpdateSpellCommand)
export class UpdateSpellHandler implements ICommandHandler<UpdateSpellCommand, Spell> {
  constructor(
    @Inject('SpellRepository') private readonly spellRepository: SpellRepository,
    @Inject('SpellEventProducer') private readonly spellEventBus: SpellEventBusPort,
  ) {}

  async execute(command: UpdateSpellCommand): Promise<Spell> {
    const spell = await this.spellRepository.findById(command.id);
    if (!spell) {
      throw new NotFoundError('Spell', command.id);
    }
    spell.update({
      name: command.name,
      shortDescription: command.shortDescription,
      description: command.description,
      imageUrl: command.imageUrl,
    });
    const updated = await this.spellRepository.update(spell.id, spell);
    spell.getUncommittedEvents().forEach((event) => this.spellEventBus.publish(event));
    return updated;
  }
}

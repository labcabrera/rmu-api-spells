import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateSpellCommand } from '../commands/update-spell.command';
import { NotFoundError } from 'src/modules/shared/domain/errors/errors';
import { Spell } from 'src/modules/spells/domain/aggregates/spell';
import type { SpellEventBusPort } from '../../ports/spell-event-bus.port';
import type { SpellRepository } from '../../ports/spell-list-repository';
import type { SpellGuardPort } from '../../ports/spell-guard.port';

@CommandHandler(UpdateSpellCommand)
export class UpdateSpellHandler implements ICommandHandler<UpdateSpellCommand, Spell> {
  constructor(
    @Inject('SpellRepository') private readonly spellRepository: SpellRepository,
    @Inject('SpellGuardPort') private readonly spellGuard: SpellGuardPort,
    @Inject('SpellEventProducer') private readonly spellEventBus: SpellEventBusPort,
  ) {}

  async execute(command: UpdateSpellCommand): Promise<Spell> {
    const spell = await this.spellRepository.findById(command.id);
    if (!spell) throw new NotFoundError('Spell', command.id);

    this.spellGuard.checkUpdate(spell, command.user, command.roles);

    spell.update({
      name: command.name,
      level: command.level,
      modifiers: command.modifiers,
      description: command.description,
      imageUrl: command.imageUrl,
    });
    const updated = await this.spellRepository.update(spell.id, spell);
    spell.getUncommittedEvents().forEach((event) => this.spellEventBus.publish(event));
    return updated;
  }
}

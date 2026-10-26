import { Inject } from '@nestjs/common';
import { type SpellListRepository, SPELL_LIST_REPOSITORY } from '../../../../spell-lists/application/ports/spell-list-repository.port.js';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { UpdateSpellCommand } from '../commands/update-spell.command.js';
import { NotFoundError, ValidationError } from '../../../../shared/domain/errors/errors.js';
import { Spell } from '../../../domain/aggregates/spell.js';
import { type SpellRepository, SPELL_REPOSITORY } from '../../ports/spell-repository.port.js';
import { type SpellGuardPort, SPELL_GUARD_PORT } from '../../ports/spell-guard.port.js';
import { EFFECT_TYPE_CATALOG, type EffectTypeCatalog } from '../../ports/effect-type-catalog.port.js';
import { DOMAIN_EVENT_PUBLISHER, type DomainEventPublisher } from '../../../../shared/application/ports/domain-event-publisher.port.js';

@CommandHandler(UpdateSpellCommand)
export class UpdateSpellHandler implements ICommandHandler<UpdateSpellCommand, Spell> {
  constructor(
    @Inject(SPELL_REPOSITORY) private readonly spellRepository: SpellRepository,
    @Inject(SPELL_LIST_REPOSITORY) private readonly spellListRepository: SpellListRepository,
    @Inject(SPELL_GUARD_PORT) private readonly spellGuard: SpellGuardPort,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly events: DomainEventPublisher,
    @Inject(EFFECT_TYPE_CATALOG) private readonly effectTypes: EffectTypeCatalog,
  ) {}

  async execute(command: UpdateSpellCommand): Promise<Spell> {
    const spell = await this.spellRepository.findById(command.id);
    if (!spell) throw new NotFoundError('Spell', command.id);

    const list = await this.spellListRepository.findById(spell.spellListId);
    this.spellGuard.checkUpdate(spell, list, command.userId, command.roles);
    spell.checkVersion(command.expectedVersion);

    // Moving the spell (F-spells-20): the user adds it to the other list, which must exist and be theirs.
    if (command.spellListId !== undefined && command.spellListId !== spell.spellListId) {
      const target = await this.spellListRepository.findById(command.spellListId);
      if (!target) throw new NotFoundError('SpellList', command.spellListId);
      this.spellGuard.checkCreate(target, command.userId, command.roles);
    }

    spell.update({
      spellListId: command.spellListId,
      name: command.name,
      level: command.level,
      modifiers: command.modifiers,
      accessType: command.accessType,
      description: command.description,
      imageUrl: command.imageUrl,
      basedOn: command.basedOn,
      effects: command.effects,
    });
    if (!spell.hasChanges()) return spell;
    if (command.basedOn) await this.checkBasedOn(command.basedOn);
    if (command.effects !== undefined) await this.checkStatuses(spell, command.authorization);
    const updated = await this.spellRepository.update(spell);
    await this.events.publishChanges('spell', spell);
    return updated;
  }

  /** The spell it is a variant of must exist. */
  private async checkBasedOn(basedOn: string | null): Promise<void> {
    if (basedOn && !(await this.spellRepository.findById(basedOn)))
      throw new ValidationError(`Spell ${basedOn} does not exist`, 'invalid-based-on');
  }

  /** The statuses of the effects must be ids of the effect-types catalog of core (spec 028, decision 19). */
  private async checkStatuses(spell: Spell, authorization: string | undefined): Promise<void> {
    const unknown = await this.effectTypes.findUnknown(spell.effectStatuses(), authorization);
    if (unknown.length > 0) throw new ValidationError(`Unknown effect statuses: ${unknown.join(', ')}`, 'unknown-effect-status');
  }
}

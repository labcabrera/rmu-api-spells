import { Inject, Logger } from '@nestjs/common';
import { type SpellListRepository, SPELL_LIST_REPOSITORY } from '../../../../spell-lists/application/ports/spell-list-repository.port.js';
import { NotFoundError, ValidationError } from '../../../../shared/domain/errors/errors.js';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { CreateSpellCommand } from '../commands/create-spell.command.js';
import { type SpellRepository, SPELL_REPOSITORY } from '../../ports/spell-repository.port.js';
import { Spell } from '../../../domain/aggregates/spell.js';
import { type SpellGuardPort, SPELL_GUARD_PORT } from '../../ports/spell-guard.port.js';
import { EFFECT_TYPE_CATALOG, type EffectTypeCatalog } from '../../ports/effect-type-catalog.port.js';
import { DOMAIN_EVENT_PUBLISHER, type DomainEventPublisher } from '../../../../shared/application/ports/domain-event-publisher.port.js';

@CommandHandler(CreateSpellCommand)
export class CreateSpellHandler implements ICommandHandler<CreateSpellCommand, Spell> {
  private readonly logger = new Logger(CreateSpellHandler.name);

  constructor(
    @Inject(SPELL_REPOSITORY) private readonly spellRepository: SpellRepository,
    @Inject(SPELL_LIST_REPOSITORY) private readonly spellListRepository: SpellListRepository,
    @Inject(SPELL_GUARD_PORT) private readonly spellGuard: SpellGuardPort,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly events: DomainEventPublisher,
    @Inject(EFFECT_TYPE_CATALOG) private readonly effectTypes: EffectTypeCatalog,
  ) {}

  async execute(command: CreateSpellCommand): Promise<Spell> {
    this.logger.log(`Creating spell ${command.name} for user ${command.userId}`);
    const list = await this.spellListRepository.findById(command.spellListId);
    if (!list) throw new NotFoundError('SpellList', command.spellListId);
    this.spellGuard.checkCreate(list, command.userId, command.roles);
    const spell = Spell.create({
      spellListId: command.spellListId,
      name: command.name,
      level: command.level,
      modifiers: command.modifiers,
      accessType: command.accessType,
      description: command.description,
      imageUrl: command.imageUrl,
      owner: command.userId,
      basedOn: command.basedOn,
      effects: command.effects,
    });
    await this.checkBasedOn(command.basedOn);
    await this.checkStatuses(spell, command.authorization);
    const savedSpell = await this.spellRepository.save(spell);
    await this.events.publishChanges('spell', spell);
    return savedSpell;
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

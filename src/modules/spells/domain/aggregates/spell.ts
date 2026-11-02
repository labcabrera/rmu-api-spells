import { BaseAggregateRoot } from '../../../shared/domain/aggregates/base-aggregate.js';
import { SpellCreatedEvent } from '../events/spell-created.event.js';
import { SpellUpdatedEvent } from '../events/spell-updated.event.js';
import { randomUUID } from 'crypto';
import { SpellProps } from './spell.props.js';
import { SpellModifiers } from '../value-objects/spell-modifiers.vo.js';
import { validateSpellEffects, type SpellEffect } from '../value-objects/spell-effect.vo.js';
import { ALCHEMY_FAILURE_TABLES, SPELL_ALCHEMY_EFFECT_KINDS, type SpellAlchemy } from '../value-objects/spell-alchemy.vo.js';
import { ValidationError } from '../../../shared/domain/errors/errors.js';
import type { AccessType } from '../../../shared/domain/entities/access-type.js';
import type { EntitySource } from '../../../shared/domain/entities/entity-source.js';

export type SpellPatch = Partial<{
  spellListId: string;
  name: string;
  level: number;
  modifiers: Partial<SpellModifiers>;
  basedOn: string | null;
  effects: SpellEffect[];
  alchemy: SpellAlchemy | null;
  accessType: AccessType;
  entitySource: EntitySource;
  description: string | null;
  imageUrl: string | null;
}>;

export class Spell extends BaseAggregateRoot<SpellProps> {
  private constructor(
    id: string,
    public spellListId: string,
    public name: string,
    public level: number,
    public modifiers: SpellModifiers,
    public basedOn: string | null,
    public effects: SpellEffect[],
    public alchemy: SpellAlchemy | null,
    public accessType: AccessType,
    public entitySource: EntitySource,
    public description: string | undefined,
    public imageUrl: string | undefined,
    public owner: string,
    public createdAt: Date,
    public updatedAt: Date | undefined,
  ) {
    super(id);
  }
  static create(props: Omit<SpellProps, 'id' | 'createdAt' | 'updatedAt'>) {
    const spell = new Spell(
      randomUUID(),
      props.spellListId,
      props.name,
      props.level,
      props.modifiers,
      props.basedOn ?? null,
      props.effects ?? [],
      props.alchemy ?? null,
      props.accessType,
      props.entitySource ?? 'user',
      props.description,
      props.imageUrl,
      props.owner,
      new Date(),
      undefined,
    );
    spell.validate();
    spell.apply(new SpellCreatedEvent(spell.getProps()));
    return spell;
  }

  static fromProps(props: SpellProps) {
    return new Spell(
      props.id,
      props.spellListId,
      props.name,
      props.level,
      props.modifiers,
      props.basedOn ?? null,
      props.effects ?? [],
      props.alchemy ?? null,
      props.accessType,
      props.entitySource ?? 'user',
      props.description,
      props.imageUrl,
      props.owner,
      props.createdAt,
      props.updatedAt,
    );
  }

  getProps(): SpellProps {
    return {
      id: this.id,
      spellListId: this.spellListId,
      name: this.name,
      level: this.level,
      modifiers: this.modifiers,
      basedOn: this.basedOn,
      effects: this.effects,
      alchemy: this.alchemy,
      accessType: this.accessType,
      entitySource: this.entitySource,
      description: this.description,
      imageUrl: this.imageUrl,
      owner: this.owner,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Applies a patch: undefined keeps a field, '' or null clears the optional texts (F-spells-18), and the modifiers are
   * merged field by field (F-spells-19).
   */
  update(props: SpellPatch): void {
    if (props.spellListId !== undefined) this.spellListId = props.spellListId;
    if (props.name !== undefined) this.name = props.name;
    if (props.level !== undefined) this.level = props.level;
    if (props.modifiers !== undefined) this.modifiers = this.modifiers.merge(props.modifiers);
    if (props.basedOn !== undefined) this.basedOn = props.basedOn || null;
    if (props.effects !== undefined) this.effects = props.effects;
    if (props.alchemy !== undefined) this.alchemy = props.alchemy;
    if (props.accessType !== undefined) this.accessType = props.accessType;
    if (props.entitySource !== undefined) this.entitySource = props.entitySource;
    if (props.description !== undefined) this.description = props.description || undefined;
    if (props.imageUrl !== undefined) this.imageUrl = props.imageUrl || undefined;
    this.validate();
    // A patch that changes nothing is not an update: no new updatedAt, no write and no event (hasChanges()).
    if (!this.hasChanges()) return;
    this.updatedAt = new Date();
    this.apply(new SpellUpdatedEvent(this.getProps()));
  }

  /** The statuses its effects use, to check against the effect-types catalog of core. */
  effectStatuses(): string[] {
    return validateSpellEffects(this.effects);
  }

  private validate(): void {
    validateSpellEffects(this.effects);
    if (this.basedOn !== null && this.basedOn === this.id)
      throw new ValidationError('A spell cannot be based on itself', 'invalid-based-on');
    const pp = this.modifiers.powerPoints;
    if (pp !== null && (!Number.isInteger(pp) || pp < 0)) throw new ValidationError('powerPoints must be 0 or more', 'invalid-modifiers');
    this.validateAlchemy();
  }

  /** Spec 064: one of the 10 failure tables and, if it has one, an effect of a known kind with a finite value. */
  private validateAlchemy(): void {
    const alchemy = this.alchemy;
    if (alchemy === null) return;
    if (!(ALCHEMY_FAILURE_TABLES as readonly string[]).includes(alchemy.failureTable))
      throw new ValidationError(`Unknown alchemy failure table: ${alchemy.failureTable}`, 'invalid-alchemy');
    const effect = alchemy.effect;
    if (effect && (!(SPELL_ALCHEMY_EFFECT_KINDS as readonly string[]).includes(effect.kind) || !Number.isFinite(effect.value)))
      throw new ValidationError('Invalid alchemy effect', 'invalid-alchemy');
  }
}

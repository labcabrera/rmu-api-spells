import { BaseAggregateRoot } from '../../../shared/domain/aggregates/base-aggregate.js';
import { SpellCreatedEvent } from '../events/spell-created.event.js';
import { SpellUpdatedEvent } from '../events/spell-updated.event.js';
import { randomUUID } from 'crypto';
import { SpellProps } from './spell.props.js';
import { SpellModifiers } from '../value-objects/spell-modifiers.vo.js';
import type { AccessType } from '../../../shared/domain/entities/access-type.js';

export type SpellPatch = Partial<{
  spellListId: string;
  name: string;
  level: number;
  modifiers: Partial<SpellModifiers>;
  accessType: AccessType;
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
    public accessType: AccessType,
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
      props.accessType,
      props.description,
      props.imageUrl,
      props.owner,
      new Date(),
      undefined,
    );
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
      props.accessType,
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
      accessType: this.accessType,
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
    if (props.accessType !== undefined) this.accessType = props.accessType;
    if (props.description !== undefined) this.description = props.description || undefined;
    if (props.imageUrl !== undefined) this.imageUrl = props.imageUrl || undefined;
    // A patch that changes nothing is not an update: no new updatedAt, no write and no event (hasChanges()).
    if (!this.hasChanges()) return;
    this.updatedAt = new Date();
    this.apply(new SpellUpdatedEvent(this.getProps()));
  }
}

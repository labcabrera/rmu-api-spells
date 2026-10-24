import { BaseAggregateRoot } from '../../../shared/domain/aggregates/base-aggregate.js';
import { SpellCreatedEvent } from '../events/spell-created.event.js';
import { SpellUpdatedEvent } from '../events/spell-updated.event.js';
import { randomUUID } from 'crypto';
import { SpellProps } from './spell.props.js';
import { SpellModifiers } from '../value-objects/spell-modifiers.vo.js';
import type { AccessType } from '../../../shared/domain/entities/access-type.js';

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

  update(props: Partial<Omit<SpellProps, 'id' | 'owner' | 'createdAt' | 'updatedAt'>>): void {
    if (props.spellListId) this.spellListId = props.spellListId;
    if (props.name) this.name = props.name;
    if (props.level) this.level = props.level;
    if (props.modifiers) this.modifiers = props.modifiers;
    if (props.accessType) this.accessType = props.accessType;
    if (props.description) this.description = props.description;
    if (props.imageUrl !== undefined) this.imageUrl = props.imageUrl;
    // A patch that changes nothing is not an update: no new updatedAt, no write and no event (hasChanges()).
    if (!this.hasChanges()) return;
    this.updatedAt = new Date();
    this.apply(new SpellUpdatedEvent(this.getProps()));
  }
}

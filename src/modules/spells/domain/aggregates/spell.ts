import { AggregateRoot } from '@nestjs/cqrs';
import { SpellCreatedEvent } from '../events/spell-created.event';
import { SpellUpdatedEvent } from '../events/spell-updated.event';
import { randomUUID } from 'crypto';
import { DomainEvent } from 'src/modules/shared/domain/events/domain-event';
import { SpellProps } from './spell.props';
import { SpellModifiers } from '../value-objects/spell-modifiers.vo';

export class Spell extends AggregateRoot<DomainEvent<SpellProps>> {
  private constructor(
    public id: string,
    public spellListId: string,
    public name: string,
    public level: number,
    public modifiers: SpellModifiers,
    public description: string | undefined,
    public imageUrl: string | undefined,
    public owner: string,
    public createdAt: Date,
    public updatedAt: Date | undefined,
  ) {
    super();
  }
  static create(props: Omit<SpellProps, 'id' | 'createdAt' | 'updatedAt'>) {
    const spell = new Spell(
      randomUUID(),
      props.spellListId,
      props.name,
      props.level,
      props.modifiers,
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
      description: this.description,
      imageUrl: this.imageUrl,
      owner: this.owner,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  update(props: Partial<Omit<SpellProps, 'id' | 'spellListId' | 'owner' | 'createdAt' | 'updatedAt'>>) {
    if (props.name) this.name = props.name;
    if (props.level) this.level = props.level;
    if (props.modifiers) this.modifiers = props.modifiers;
    if (props.description) this.description = props.description;
    if (props.imageUrl !== undefined) this.imageUrl = props.imageUrl;
    this.updatedAt = new Date();
    this.apply(new SpellUpdatedEvent(this.getProps()));
  }
}

import { AggregateRoot } from '@nestjs/cqrs';
import { SpellListCreatedEvent } from '../events/spell-list-created.event';
import { SpellListUpdatedEvent } from '../events/spell-list-updated.event';
import { randomUUID } from 'crypto';
import { DomainEvent } from 'src/modules/shared/domain/events/domain-event';

export class SpellListProps {
  id: string;
  name: string;
  shortDescription?: string;
  description?: string;
  imageUrl?: string;
  owner: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class SpellList extends AggregateRoot<DomainEvent<SpellListProps>> {
  private constructor(
    public id: string,
    public name: string,
    public shortDescription: string | undefined,
    public description: string | undefined,
    public imageUrl: string | undefined,
    public owner: string,
    public createdAt: Date,
    public updatedAt: Date | undefined,
  ) {
    super();
  }
  static create(props: Omit<SpellListProps, 'id' | 'createdAt' | 'updatedAt'>) {
    const spellList = new SpellList(
      randomUUID(),
      props.name,
      props.shortDescription,
      props.description,
      props.imageUrl,
      props.owner,
      new Date(),
      undefined,
    );
    spellList.apply(new SpellListCreatedEvent(spellList.getProps()));
    return spellList;
  }

  static fromProps(props: SpellListProps) {
    return new SpellList(
      props.id,
      props.name,
      props.shortDescription,
      props.description,
      props.imageUrl,
      props.owner,
      props.createdAt,
      props.updatedAt,
    );
  }

  getProps(): SpellListProps {
    return {
      id: this.id,
      name: this.name,
      shortDescription: this.shortDescription,
      description: this.description,
      imageUrl: this.imageUrl,
      owner: this.owner,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  update(props: Partial<Omit<SpellListProps, 'id' | 'owner' | 'createdAt' | 'updatedAt'>>) {
    if (props.name) this.name = props.name;
    if (props.shortDescription) this.shortDescription = props.shortDescription;
    if (props.description) this.description = props.description;
    if (props.imageUrl !== undefined) this.imageUrl = props.imageUrl;
    this.updatedAt = new Date();
    this.apply(new SpellListUpdatedEvent(this.getProps()));
  }
}

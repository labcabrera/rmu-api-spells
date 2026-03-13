import { AggregateRoot } from '@nestjs/cqrs';
import { SpellListCreatedEvent } from '../events/spell-list-created.event';
import { SpellListUpdatedEvent } from '../events/spell-list-updated.event';
import { randomUUID } from 'crypto';
import { DomainEvent } from 'src/modules/shared/domain/events/domain-event';
import { SpellListProps } from './spell-list.props';
import { RealmType } from '../value-objects/realm-type.vo';
import { ListType } from '../value-objects/list-type.vo';

export class SpellList extends AggregateRoot<DomainEvent<SpellListProps>> {
  private constructor(
    public id: string,
    public realm: RealmType,
    public type: ListType,
    public name: string,
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
      props.realm,
      props.type,
      props.name,
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
      props.realm,
      props.type,
      props.name,
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
      realm: this.realm,
      type: this.type,
      name: this.name,
      description: this.description,
      imageUrl: this.imageUrl,
      owner: this.owner,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  update(props: Partial<Omit<SpellListProps, 'id' | 'owner' | 'createdAt' | 'updatedAt'>>) {
    if (props.name) this.name = props.name;
    if (props.realm) this.realm = props.realm;
    if (props.type) this.type = props.type;
    if (props.description) this.description = props.description;
    if (props.imageUrl !== undefined) this.imageUrl = props.imageUrl;
    this.updatedAt = new Date();
    this.apply(new SpellListUpdatedEvent(this.getProps()));
  }
}

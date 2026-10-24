import { AggregateRoot } from '@nestjs/cqrs';
import { SpellListCreatedEvent } from '../events/spell-list-created.event.js';
import { SpellListUpdatedEvent } from '../events/spell-list-updated.event.js';
import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../shared/domain/events/domain-event.js';
import { SpellListProps } from './spell-list.props.js';
import type { RealmType } from '../value-objects/realm-type.vo.js';
import type { ListType } from '../value-objects/list-type.vo.js';
import { ValidationError } from '../../../shared/domain/errors/errors.js';
import type { AccessType } from '../../../shared/domain/entities/access-type.js';

export class SpellList extends AggregateRoot<DomainEvent<SpellListProps>> {
  private constructor(
    public id: string,
    public realm: RealmType,
    public type: ListType,
    public professionId: string | null,
    public accessType: AccessType,
    public name: string,
    public description: string | null,
    public imageUrl: string | null,
    public owner: string,
    public createdAt: Date,
    public updatedAt: Date | null,
  ) {
    super();
  }
  static create(props: Omit<SpellListProps, 'id' | 'createdAt' | 'updatedAt'>) {
    const spellList = new SpellList(
      randomUUID(),
      props.realm,
      props.type,
      props.professionId ?? null,
      props.accessType,
      props.name,
      props.description,
      props.imageUrl,
      props.owner,
      new Date(),
      null,
    );
    spellList.validate();
    spellList.apply(new SpellListCreatedEvent(spellList.getProps()));
    return spellList;
  }

  static fromProps(props: SpellListProps) {
    return new SpellList(
      props.id,
      props.realm,
      props.type,
      props.professionId ?? null,
      props.accessType,
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
      professionId: this.professionId,
      accessType: this.accessType,
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
    if (props.professionId !== undefined) this.professionId = props.professionId ?? null;
    if (props.accessType) this.accessType = props.accessType;
    if (props.description) this.description = props.description;
    if (props.imageUrl !== undefined) this.imageUrl = props.imageUrl;
    this.validate();
    this.updatedAt = new Date();
    this.apply(new SpellListUpdatedEvent(this.getProps()));
  }

  validate() {
    if (this.type === 'base' && !this.professionId) {
      throw new ValidationError('Required professionId creating base spell type');
    } else if (this.type !== 'base' && this.professionId) {
      throw new ValidationError('Required professionId creating base spell type');
    }
  }
}

import { BaseAggregateRoot } from '../../../shared/domain/aggregates/base-aggregate.js';
import { SpellListCreatedEvent } from '../events/spell-list-created.event.js';
import { SpellListUpdatedEvent } from '../events/spell-list-updated.event.js';
import { randomUUID } from 'crypto';
import { SpellListProps } from './spell-list.props.js';
import type { RealmType } from '../value-objects/realm-type.vo.js';
import type { ListType } from '../value-objects/list-type.vo.js';
import { ValidationError } from '../../../shared/domain/errors/errors.js';
import type { AccessType } from '../../../shared/domain/entities/access-type.js';

export class SpellList extends BaseAggregateRoot<SpellListProps> {
  private constructor(
    id: string,
    public realms: RealmType[],
    public type: ListType,
    public code: string | null,
    public bookSection: string | null,
    public professionId: string | null,
    public accessType: AccessType,
    public name: string,
    public description: string | null,
    public imageUrl: string | null,
    public owner: string,
    public createdAt: Date,
    public updatedAt: Date | null,
  ) {
    super(id);
  }
  static create(props: Omit<SpellListProps, 'id' | 'createdAt' | 'updatedAt'>) {
    const spellList = new SpellList(
      randomUUID(),
      props.realms,
      props.type,
      props.code ?? null,
      props.bookSection ?? null,
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
      props.realms,
      props.type,
      props.code ?? null,
      props.bookSection ?? null,
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
      realms: this.realms,
      type: this.type,
      code: this.code,
      bookSection: this.bookSection,
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

  /** Applies a patch: undefined keeps a field, and '' or null clears the optional ones (F-spells-18). */
  update(props: Partial<Omit<SpellListProps, 'id' | 'owner' | 'createdAt' | 'updatedAt'>>): void {
    if (props.name !== undefined) this.name = props.name;
    if (props.realms !== undefined) this.realms = props.realms;
    if (props.type !== undefined) this.type = props.type;
    if (props.code !== undefined) this.code = props.code || null;
    if (props.bookSection !== undefined) this.bookSection = props.bookSection || null;
    if (props.professionId !== undefined) this.professionId = props.professionId || null;
    if (props.accessType !== undefined) this.accessType = props.accessType;
    if (props.description !== undefined) this.description = props.description || null;
    if (props.imageUrl !== undefined) this.imageUrl = props.imageUrl || null;
    this.validate();
    // A patch that changes nothing is not an update: no new updatedAt, no write and no event (hasChanges()).
    if (!this.hasChanges()) return;
    this.updatedAt = new Date();
    this.apply(new SpellListUpdatedEvent(this.getProps()));
  }

  validate() {
    // One realm, or the two of a hybrid profession (spec 028).
    if (!Array.isArray(this.realms) || this.realms.length < 1 || this.realms.length > 2) {
      throw new ValidationError('A spell list has one or two realms', 'invalid-realms');
    }
    if (new Set(this.realms).size !== this.realms.length) {
      throw new ValidationError('The realms of a spell list must be different', 'invalid-realms');
    }
    if (this.type === 'base' && !this.professionId) {
      throw new ValidationError('Required professionId creating base spell type');
    } else if (this.type !== 'base' && this.professionId) {
      throw new ValidationError('Only a base spell list has a professionId');
    }
  }
}

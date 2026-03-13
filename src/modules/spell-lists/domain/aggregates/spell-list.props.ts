import { ListType } from '../value-objects/list-type.vo';
import { RealmType } from '../value-objects/realm-type.vo';

export class SpellListProps {
  id: string;
  name: string;
  realm: RealmType;
  type: ListType;
  description?: string;
  imageUrl?: string;
  owner: string;
  createdAt: Date;
  updatedAt?: Date;
}

import { ListType } from '../value-objects/list-type.vo';
import { RealmType } from '../value-objects/realm-type.vo';

export class SpellListProps {
  id: string;
  name: string;
  realm: RealmType;
  type: ListType;
  professionId: string | null;
  description: string | null;
  imageUrl: string | null;
  owner: string;
  createdAt: Date;
  updatedAt: Date | null;
}

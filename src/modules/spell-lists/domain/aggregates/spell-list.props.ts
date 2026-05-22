import { ListType } from '../value-objects/list-type.vo';
import { RealmType } from '../value-objects/realm-type.vo';
import { AccessType } from 'src/modules/shared/domain/entities/access-type';

export class SpellListProps {
  id: string;
  name: string;
  realm: RealmType;
  type: ListType;
  professionId: string | null;
  accessType: AccessType;
  description: string | null;
  imageUrl: string | null;
  owner: string;
  createdAt: Date;
  updatedAt: Date | null;
}

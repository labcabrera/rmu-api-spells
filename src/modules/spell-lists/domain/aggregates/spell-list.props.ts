import type { ListType } from '../value-objects/list-type.vo.js';
import type { RealmType } from '../value-objects/realm-type.vo.js';
import type { AccessType } from '../../../shared/domain/entities/access-type.js';

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

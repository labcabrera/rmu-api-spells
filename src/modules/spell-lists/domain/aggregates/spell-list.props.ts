import type { ListType } from '../value-objects/list-type.vo.js';
import type { RealmType } from '../value-objects/realm-type.vo.js';
import type { AccessType } from '../../../shared/domain/entities/access-type.js';

export class SpellListProps {
  id: string;
  name: string;
  /** One realm, or two for the base lists of the hybrid professions (spec 028). */
  realms: RealmType[];
  type: ListType;
  /** Stable slug of the book name (e.g. `fire-law`); null for lists made by users. */
  code: string | null;
  /** Spell Law section (e.g. `7.2`); null for lists made by users. */
  bookSection: string | null;
  professionId: string | null;
  accessType: AccessType;
  description: string | null;
  imageUrl: string | null;
  owner: string;
  createdAt: Date;
  updatedAt: Date | null;
}

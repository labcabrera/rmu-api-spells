import { NamedEntity } from 'src/modules/shared/domain/entities/named-entity';

export class SpellProps {
  id: string;
  name: string;
  spellList?: NamedEntity;
  description?: string;
  imageUrl?: string;
  owner: string;
  createdAt: Date;
  updatedAt?: Date;
}

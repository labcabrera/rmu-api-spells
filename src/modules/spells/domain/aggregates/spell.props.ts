import { SpellModifiers } from '../value-objects/spell-modifiers.vo';
import { AccessType } from 'src/modules/shared/domain/entities/access-type';

export class SpellProps {
  id: string;
  spellListId: string;
  name: string;
  level: number;
  modifiers: SpellModifiers;
  accessType: AccessType;
  description: string | undefined;
  imageUrl: string | undefined;
  owner: string;
  createdAt: Date;
  updatedAt?: Date;
}

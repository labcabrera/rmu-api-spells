import { SpellModifiers } from '../value-objects/spell-modifiers.vo.js';
import type { AccessType } from '../../../shared/domain/entities/access-type.js';

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

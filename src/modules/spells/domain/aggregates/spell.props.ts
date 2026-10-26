import type { SpellEffect } from '../value-objects/spell-effect.vo.js';
import { SpellModifiers } from '../value-objects/spell-modifiers.vo.js';
import type { AccessType } from '../../../shared/domain/entities/access-type.js';

export class SpellProps {
  id: string;
  spellListId: string;
  name: string;
  level: number;
  modifiers: SpellModifiers;
  /** Id of the spell it is defined from ("as X, except…"); null if none (spec 028). */
  basedOn: string | null;
  /** What it does to its targets (spec 028). */
  effects: SpellEffect[];
  accessType: AccessType;
  description: string | undefined;
  imageUrl: string | undefined;
  owner: string;
  createdAt: Date;
  updatedAt?: Date;
}

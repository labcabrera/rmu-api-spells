import type { SpellEffect } from '../value-objects/spell-effect.vo.js';
import { SpellModifiers } from '../value-objects/spell-modifiers.vo.js';
import type { SpellAlchemy } from '../value-objects/spell-alchemy.vo.js';
import type { AccessType } from '../../../shared/domain/entities/access-type.js';
import type { EntitySource } from '../../../shared/domain/entities/entity-source.js';

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
  /** How it is embedded in an item (spec 064); null if it is not alchemical. */
  alchemy: SpellAlchemy | null;
  accessType: AccessType;
  /** Spec 063: the source of its list; a spell without a list has its own. */
  entitySource: EntitySource;
  description: string | undefined;
  /** Null: the spell shows the image of its list. */
  imageUrl: string | null;
  owner: string;
  createdAt: Date;
  updatedAt?: Date;
}

import { SpellModifiers } from '../../../domain/value-objects/spell-modifiers.vo.js';
import type { SpellEffect } from '../../../domain/value-objects/spell-effect.vo.js';
import type { AccessType } from '../../../../shared/domain/entities/access-type.js';
import { AuthenticatedCommand } from '../../../../shared/application/cqrs/authenticated-command.js';

export class CreateSpellCommand extends AuthenticatedCommand {
  constructor(
    public readonly spellListId: string,
    public readonly name: string,
    public readonly level: number,
    public readonly modifiers: SpellModifiers,
    public readonly accessType: AccessType,
    public readonly description: string | undefined,
    public readonly imageUrl: string | undefined,
    userId: string,
    roles: string[],
    /** Id of the spell it is a variant of ("as X, but…"). */
    public readonly basedOn: string | null = null,
    public readonly effects: SpellEffect[] = [],
    /** Authorization header of the request, to read the effect-types catalog of core. */
    public readonly authorization?: string,
  ) {
    super(userId, roles);
  }
}

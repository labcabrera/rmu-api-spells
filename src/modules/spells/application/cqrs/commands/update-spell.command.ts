import { SpellModifiers } from '../../../domain/value-objects/spell-modifiers.vo.js';
import type { SpellEffect } from '../../../domain/value-objects/spell-effect.vo.js';
import type { AccessType } from '../../../../shared/domain/entities/access-type.js';
import { AuthenticatedCommand } from '../../../../shared/application/cqrs/authenticated-command.js';

export class UpdateSpellCommand extends AuthenticatedCommand {
  constructor(
    public readonly id: string,
    public readonly name: string | undefined,
    public readonly level: number | undefined,
    /** Only the modifiers that change. */
    public readonly modifiers: Partial<SpellModifiers> | undefined,
    public readonly accessType: AccessType | undefined,
    /** '' or null clears it. */
    public readonly description: string | null | undefined,
    public readonly imageUrl: string | null | undefined,
    userId: string,
    roles: string[],
    /** The version the client read; undefined applies the change to the current one. */
    public readonly expectedVersion?: number,
    /** The list the spell moves to; undefined keeps it in its list. */
    public readonly spellListId?: string,
    /** null clears it. */
    public readonly basedOn?: string | null,
    /** Replaces every effect. */
    public readonly effects?: SpellEffect[],
    public readonly authorization?: string,
  ) {
    super(userId, roles);
  }
}

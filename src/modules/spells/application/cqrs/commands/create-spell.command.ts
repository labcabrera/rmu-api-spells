import { SpellModifiers } from 'src/modules/spells/domain/value-objects/spell-modifiers.vo';
import { AccessType } from 'src/modules/shared/domain/entities/access-type';
import { AuthenticatedCommand } from 'src/modules/shared/application/cqrs/authenticated-command';

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
  ) {
    super(userId, roles);
  }
}

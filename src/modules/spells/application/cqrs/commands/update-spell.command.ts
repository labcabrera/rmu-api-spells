import { SpellModifiers } from 'src/modules/spells/domain/value-objects/spell-modifiers.vo';
import { AccessType } from 'src/modules/shared/domain/entities/access-type';
import { AuthenticatedCommand } from 'src/modules/shared/application/cqrs/authenticated-command';

export class UpdateSpellCommand extends AuthenticatedCommand {
  constructor(
    public readonly id: string,
    public readonly name: string | undefined,
    public readonly level: number | undefined,
    public readonly modifiers: SpellModifiers | undefined,
    public readonly accessType: AccessType | undefined,
    public readonly description: string | undefined,
    public readonly imageUrl: string | undefined,
    userId: string,
    roles: string[],
  ) {
    super(userId, roles);
  }
}

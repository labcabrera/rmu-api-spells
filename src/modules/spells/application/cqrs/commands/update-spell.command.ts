import { SpellModifiers } from '../../../domain/value-objects/spell-modifiers.vo';
import { AccessType } from '../../../../shared/domain/entities/access-type';
import { AuthenticatedCommand } from '../../../../shared/application/cqrs/authenticated-command';

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

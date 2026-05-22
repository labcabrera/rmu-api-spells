import { ListType } from 'src/modules/spell-lists/domain/value-objects/list-type.vo';
import { RealmType } from 'src/modules/spell-lists/domain/value-objects/realm-type.vo';
import { AccessType } from 'src/modules/shared/domain/entities/access-type';
import { AuthenticatedCommand } from 'src/modules/shared/application/cqrs/authenticated-command';

export class UpdateSpellListCommand extends AuthenticatedCommand {
  constructor(
    public readonly id: string,
    public readonly name: string | undefined,
    public readonly realm: RealmType | undefined,
    public readonly type: ListType | undefined,
    public readonly professionId: string | undefined,
    public readonly accessType: AccessType | undefined,
    public readonly description: string | undefined,
    public readonly imageUrl: string | undefined,
    userId: string,
    roles: string[],
  ) {
    super(userId, roles);
  }
}

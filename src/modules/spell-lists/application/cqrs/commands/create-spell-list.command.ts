import { ListType } from '../../../domain/value-objects/list-type.vo';
import { RealmType } from '../../../domain/value-objects/realm-type.vo';
import { AccessType } from '../../../../shared/domain/entities/access-type';
import { AuthenticatedCommand } from '../../../../shared/application/cqrs/authenticated-command';

export class CreateSpellListCommand extends AuthenticatedCommand {
  constructor(
    public readonly name: string,
    public readonly realm: RealmType,
    public readonly type: ListType,
    public readonly professionId: string | null,
    public readonly accessType: AccessType,
    public readonly description: string | null,
    public readonly imageUrl: string | null,
    userId: string,
    roles: string[],
  ) {
    super(userId, roles);
  }
}

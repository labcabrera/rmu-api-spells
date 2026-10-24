import type { ListType } from '../../../domain/value-objects/list-type.vo.js';
import type { RealmType } from '../../../domain/value-objects/realm-type.vo.js';
import type { AccessType } from '../../../../shared/domain/entities/access-type.js';
import { AuthenticatedCommand } from '../../../../shared/application/cqrs/authenticated-command.js';

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

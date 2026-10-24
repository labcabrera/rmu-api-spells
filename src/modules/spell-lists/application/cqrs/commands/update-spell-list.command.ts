import type { ListType } from '../../../domain/value-objects/list-type.vo.js';
import type { RealmType } from '../../../domain/value-objects/realm-type.vo.js';
import type { AccessType } from '../../../../shared/domain/entities/access-type.js';
import { AuthenticatedCommand } from '../../../../shared/application/cqrs/authenticated-command.js';

export class UpdateSpellListCommand extends AuthenticatedCommand {
  constructor(
    public readonly id: string,
    public readonly name: string | undefined,
    public readonly realm: RealmType | undefined,
    public readonly type: ListType | undefined,
    /** '' or null clears it, as the description and the image. */
    public readonly professionId: string | null | undefined,
    public readonly accessType: AccessType | undefined,
    public readonly description: string | null | undefined,
    public readonly imageUrl: string | null | undefined,
    userId: string,
    roles: string[],
    /** The version the client read; undefined applies the change to the current one. */
    public readonly expectedVersion?: number,
  ) {
    super(userId, roles);
  }
}

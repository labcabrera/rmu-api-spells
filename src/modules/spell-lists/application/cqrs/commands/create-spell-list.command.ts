import { ListType } from 'src/modules/spell-lists/domain/value-objects/list-type.vo';
import { RealmType } from 'src/modules/spell-lists/domain/value-objects/realm-type.vo';
import { AccessType } from 'src/modules/shared/domain/entities/access-type';

export class CreateSpellListCommand {
  constructor(
    public readonly name: string,
    public readonly realm: RealmType,
    public readonly type: ListType,
    public readonly professionId: string | null,
    public readonly accessType: AccessType,
    public readonly description: string | null,
    public readonly imageUrl: string | null,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}

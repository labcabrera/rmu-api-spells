import { ListType } from 'src/modules/spell-lists/domain/value-objects/list-type.vo';
import { RealmType } from 'src/modules/spell-lists/domain/value-objects/realm-type.vo';

export class UpdateSpellListCommand {
  constructor(
    public readonly id: string,
    public readonly name: string | undefined,
    public readonly realm: RealmType | undefined,
    public readonly type: ListType | undefined,
    public readonly description: string | undefined,
    public readonly imageUrl: string | undefined,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}

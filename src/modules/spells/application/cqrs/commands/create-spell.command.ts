import { NamedEntity } from 'src/modules/shared/domain/entities/named-entity';

export class CreateSpellCommand {
  constructor(
    public readonly name: string,
    public readonly spellList: NamedEntity | undefined,
    public readonly description: string | undefined,
    public readonly imageUrl: string | undefined,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}

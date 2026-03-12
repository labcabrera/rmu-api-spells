export class UpdateSpellCommand {
  constructor(
    public readonly id: string,
    public readonly name: string | undefined,
    public readonly spellList: import('src/modules/shared/domain/entities/named-entity').NamedEntity | undefined,
    public readonly description: string | undefined,
    public readonly imageUrl: string | undefined,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}

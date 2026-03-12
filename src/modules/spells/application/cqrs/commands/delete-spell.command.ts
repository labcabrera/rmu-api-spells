export class DeleteSpellCommand {
  constructor(
    public readonly spellId: string,
    public readonly user: string,
    public readonly roles: string[] | undefined,
  ) {}
}

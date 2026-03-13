export class DeleteSpellListCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly roles: string[] | undefined,
  ) {}
}

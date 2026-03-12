export class GetSpellListQuery {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}

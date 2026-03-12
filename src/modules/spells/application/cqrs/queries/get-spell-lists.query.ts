import { Sort } from 'src/modules/shared/domain/entities/page';

export class GetSpellsQuery {
  constructor(
    public readonly rsql: string | undefined,
    public readonly sort: Sort | undefined,
    public readonly page: number,
    public readonly size: number,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}

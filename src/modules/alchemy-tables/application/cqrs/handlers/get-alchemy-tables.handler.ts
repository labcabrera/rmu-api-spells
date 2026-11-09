import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundError } from '../../../../shared/domain/errors/errors.js';
import { checkTreasureLawAccess } from '../../../../shared/domain/services/treasure-law-access.js';
import { ALCHEMY_TABLES_ID, type AlchemyTables } from '../../../domain/value-objects/alchemy-tables.vo.js';
import { ALCHEMY_TABLES_REPOSITORY, type AlchemyTablesRepository } from '../../ports/alchemy-tables-repository.port.js';
import { GetAlchemyTablesQuery } from '../queries/get-alchemy-tables.query.js';

@QueryHandler(GetAlchemyTablesQuery)
export class GetAlchemyTablesHandler implements IQueryHandler<GetAlchemyTablesQuery, AlchemyTables> {
  constructor(@Inject(ALCHEMY_TABLES_REPOSITORY) private readonly repository: AlchemyTablesRepository) {}

  async execute(query: GetAlchemyTablesQuery): Promise<AlchemyTables> {
    checkTreasureLawAccess(query.roles);
    const tables = await this.repository.find();
    if (!tables) throw new NotFoundError('Alchemy tables', ALCHEMY_TABLES_ID, 'alchemy-tables-not-found');
    return tables;
  }
}

import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../shared/infrastructure/security/jwt-auth.guard.js';
import { ApiErrors } from '../../../shared/interfaces/http/api-errors.decorator.js';
import type { AuthenticatedUser } from '../../../shared/interfaces/http/authenticated-request.js';
import { CurrentUser } from '../../../shared/interfaces/http/current-user.decorator.js';
import { GetSpellListQuery } from '../../application/cqrs/queries/get-spell-list.query.js';
import { GetSpellListsQuery } from '../../application/cqrs/queries/get-spell-lists.query.js';
import { SpellListDto, SpellListPageDto } from './dto/spell-list.dto.js';
import { SpellList } from '../../domain/aggregates/spell-list.js';
import { CreateSpellListDto } from './dto/create-spell-list.dto.js';
import { UpdateSpellListDto } from './dto/update-spell-list.dto.js';
import { CreateSpellListCommand } from '../../application/cqrs/commands/create-spell-list.command.js';
import { DeleteSpellListCommand } from '../../application/cqrs/commands/delete-spell-list.command.js';
import { UpdateSpellListCommand } from '../../application/cqrs/commands/update-spell-list.command.js';
import { Page } from '../../../shared/application/pagination/page.js';
import { CatalogPagedQueryDto } from '../../../shared/interfaces/http/dto/paged-rsql-query.js';

@UseGuards(JwtAuthGuard)
@Controller('v1/spell-lists')
@ApiTags('Spell Lists')
export class SpellListController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get(':id')
  @ApiOperation({ operationId: 'findSpellListById', summary: 'Find spell list by id' })
  @ApiOkResponse({ type: SpellListDto, description: 'Success' })
  @ApiErrors({ 403: 'Not readable by the user', 404: 'Spell list not found' })
  async findById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const userId = user.id;
    const roles = user.roles;
    const query = new GetSpellListQuery(id, userId, roles);
    const entity = await this.queryBus.execute<GetSpellListQuery, SpellList>(query);
    return SpellListDto.fromEntity(entity);
  }

  @Get('')
  // The lists are a catalog loaded whole (171 in the books), so the page goes up to 1000 (spec 056).
  @ApiOperation({ operationId: 'findSpellLists', summary: 'Find spell lists by RSQL' })
  @ApiOkResponse({ type: SpellListPageDto, description: 'Success' })
  @ApiErrors({ 400: 'Invalid RSQL query' })
  async find(@Query() dto: CatalogPagedQueryDto, @CurrentUser() user: AuthenticatedUser) {
    const userId: string = user.id;
    const roles: string[] = user.roles;
    const query = new GetSpellListsQuery(dto.q, dto.page, dto.size, userId, roles);
    const page = await this.queryBus.execute<GetSpellListsQuery, Page<SpellList>>(query);
    const mapped = page.content.map(spellList => SpellListDto.fromEntity(spellList));
    return new Page<SpellListDto>(mapped, page.pagination.page, page.pagination.size, page.pagination.totalElements);
  }

  @Post('')
  @ApiBody({ type: CreateSpellListDto })
  @ApiOperation({ operationId: 'createSpellList', summary: 'Create a new spell list' })
  @ApiCreatedResponse({ type: SpellListDto, description: 'Created' })
  @ApiErrors({
    400: 'Bad request, invalid data',
    403: 'The user cannot create lists',
    409: 'The user already has a list with that name (name-in-use)',
  })
  async create(@Body() dto: CreateSpellListDto, @CurrentUser() user: AuthenticatedUser) {
    const userId: string = user.id;
    const roles: string[] = user.roles;
    const command = CreateSpellListDto.toCommand(dto, userId, roles);
    const entity = await this.commandBus.execute<CreateSpellListCommand, SpellList>(command);
    return SpellListDto.fromEntity(entity);
  }

  @Patch(':id')
  @ApiOperation({ operationId: 'updateSpellList', summary: 'Update spell list' })
  @ApiOkResponse({ type: SpellListDto, description: 'Success' })
  @ApiErrors({
    400: 'Bad request, invalid data',
    403: 'Not changeable by the user',
    404: 'Spell list not found',
    409: 'Stale version (version-conflict) or name in use',
  })
  async updateSettings(@Param('id') id: string, @Body() dto: UpdateSpellListDto, @CurrentUser() user: AuthenticatedUser) {
    const command = UpdateSpellListDto.toCommand(id, dto, user.id, user.roles);
    const entity = await this.commandBus.execute<UpdateSpellListCommand, SpellList>(command);
    return SpellListDto.fromEntity(entity);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Deleted' })
  @ApiOperation({ operationId: 'deleteSpellList', summary: 'Delete spell list by id' })
  @ApiErrors({ 403: 'Not deletable by the user', 404: 'Spell list not found', 409: 'The spell list still has spells (has-spells)' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const userId: string = user.id;
    const roles: string[] = user.roles;
    const command = new DeleteSpellListCommand(id, userId, roles);
    await this.commandBus.execute(command);
  }
}

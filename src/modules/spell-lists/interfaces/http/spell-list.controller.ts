/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from 'src/modules/auth/jwt.auth.guard';
import { GetSpellListQuery } from '../../application/cqrs/queries/get-spell-list.query';
import { GetSpellListsQuery } from '../../application/cqrs/queries/get-spell-lists.query';
import { SpellListDto, SpellListPageDto } from './dtos/spell-list.dto';
import { SpellList } from '../../domain/aggregates/spell-list';
import { CreateSpellListDto } from './dtos/create-spell-list.dto';
import { UpdateSpellListDto } from './dtos/update-spell-list.dto';
import { CreateSpellListCommand } from '../../application/cqrs/commands/create-spell-list.command';
import { DeleteSpellListCommand } from '../../application/cqrs/commands/delete-spell-list.command';
import { UpdateSpellListCommand } from '../../application/cqrs/commands/update-spell-list.command';
import { Page } from 'src/modules/shared/domain/entities/page';
import { ErrorDto } from 'src/modules/shared/interfaces/http/dto/error-dto';
import { PagedQueryDto } from 'src/modules/shared/interfaces/http/dto/paged-rsql-query';

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
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  @ApiNotFoundResponse({ description: 'Spell list not found', type: ErrorDto })
  async findById(@Param('id') id: string, @Request() req) {
    const userId = req.user!.id as string;
    const roles = req.user!.roles as string[];
    const query = new GetSpellListQuery(id, userId, roles);
    const entity = await this.queryBus.execute<GetSpellListQuery, SpellList>(query);
    return SpellListDto.fromEntity(entity);
  }

  @Get('')
  @ApiOperation({ operationId: 'findSpellLists', summary: 'Find spell lists by RSQL' })
  @ApiOkResponse({ type: SpellListPageDto, description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  @ApiResponse({ status: 400, description: 'Invalid RSQL query', type: ErrorDto })
  async find(@Query() dto: PagedQueryDto, @Request() req) {
    const userId: string = req.user!.id as string;
    const roles: string[] = req.user!.roles as string[];
    const query = new GetSpellListsQuery(dto.q, dto.page, dto.size, userId, roles);
    const page = await this.queryBus.execute<GetSpellListsQuery, Page<SpellList>>(query);
    const mapped = page.content.map((spellList) => SpellListDto.fromEntity(spellList));
    return new Page<SpellListDto>(mapped, page.pagination.page, page.pagination.size, page.pagination.totalElements);
  }

  @Post('')
  @ApiBody({ type: CreateSpellListDto })
  @ApiOperation({ operationId: 'createSpellList', summary: 'Create a new spell list' })
  @ApiOkResponse({ type: SpellListDto, description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  @ApiResponse({ status: 400, description: 'Bad request, invalid data', type: ErrorDto })
  @ApiResponse({ status: 409, description: 'Conflict, spell list already exists', type: ErrorDto })
  async create(@Body() dto: CreateSpellListDto, @Request() req) {
    const user = req.user!;
    const command = CreateSpellListDto.toCommand(dto, user.id as string, user.roles as string[]);
    const entity = await this.commandBus.execute<CreateSpellListCommand, SpellList>(command);
    return SpellListDto.fromEntity(entity);
  }

  @Patch(':id')
  @ApiOperation({ operationId: 'updateSpellList', summary: 'Update spell list' })
  @ApiOkResponse({ type: SpellListDto, description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  @ApiNotFoundResponse({ description: 'Spell list not found', type: ErrorDto })
  @ApiResponse({ status: 400, description: 'Bad request, invalid data', type: ErrorDto })
  async updateSettings(@Param('id') id: string, @Body() dto: UpdateSpellListDto, @Request() req) {
    const user = req.user!;
    const command = UpdateSpellListDto.toCommand(id, dto, user.id as string, user.roles as string[]);
    const entity = await this.commandBus.execute<UpdateSpellListCommand, SpellList>(command);
    return SpellListDto.fromEntity(entity);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteSpellList', summary: 'Delete spell list by id' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  @ApiNotFoundResponse({ description: 'Spell list not found', type: ErrorDto })
  async delete(@Param('id') id: string, @Request() req) {
    const user = req.user!;
    const command = new DeleteSpellListCommand(id, undefined, user.id as string, user.roles! as string[]);
    await this.commandBus.execute(command);
  }
}

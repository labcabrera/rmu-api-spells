/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from 'src/modules/auth/jwt.auth.guard';
import { SpellDto, SpellPageDto } from './dtos/spell.dto';
import { CreateSpellDto } from './dtos/create-spell.dto';
import { UpdateSpellDto } from './dtos/update-spell.dto';
import { CreateSpellCommand } from '../../application/cqrs/commands/create-spell.command';
import { DeleteSpellCommand } from '../../application/cqrs/commands/delete-spell.command';
import { UpdateSpellCommand } from '../../application/cqrs/commands/update-spell.command';
import { Page } from 'src/modules/shared/domain/entities/page';
import { ErrorDto } from 'src/modules/shared/interfaces/http/dto/error-dto';
import { PagedQueryDto } from 'src/modules/shared/interfaces/http/dto/paged-rsql-query';
import { GetSpellQuery } from '../../application/cqrs/queries/get-spell.query';
import { GetSpellsQuery } from '../../application/cqrs/queries/get-spell-lists.query';
import { Spell } from '../../domain/aggregates/spell';

@UseGuards(JwtAuthGuard)
@Controller('v1/spells')
@ApiTags('Spells')
export class SpellListController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get(':id')
  @ApiOperation({ operationId: 'findSpellListById', summary: 'Find spell list by id' })
  @ApiOkResponse({ type: SpellDto, description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  @ApiNotFoundResponse({ description: 'Spell list not found', type: ErrorDto })
  async findById(@Param('id') id: string, @Request() req) {
    const userId = req.user!.id as string;
    const roles = req.user!.roles as string[];
    const query = new GetSpellQuery(id, userId, roles);
    const entity = await this.queryBus.execute<GetSpellQuery, Spell>(query);
    return SpellDto.fromEntity(entity);
  }

  @Get('')
  @ApiOperation({ operationId: 'findSpellLists', summary: 'Find spell lists by RSQL' })
  @ApiOkResponse({ type: SpellPageDto, description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  @ApiResponse({ status: 400, description: 'Invalid RSQL query', type: ErrorDto })
  async find(@Query() dto: PagedQueryDto, @Request() req) {
    const userId: string = req.user!.id as string;
    const roles: string[] = req.user!.roles as string[];
    const query = new GetSpellsQuery(dto.q, dto.page, dto.size, userId, roles);
    const page = await this.queryBus.execute<GetSpellsQuery, Page<Spell>>(query);
    const mapped = page.content.map((spell) => SpellDto.fromEntity(spell));
    return new Page<SpellDto>(mapped, page.pagination.page, page.pagination.size, page.pagination.totalElements);
  }

  @Post('')
  @ApiBody({ type: CreateSpellDto })
  @ApiOperation({ operationId: 'createSpell', summary: 'Create a new spell' })
  @ApiOkResponse({ type: SpellDto, description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  @ApiResponse({ status: 400, description: 'Bad request, invalid data', type: ErrorDto })
  @ApiResponse({ status: 409, description: 'Conflict, spell list already exists', type: ErrorDto })
  async create(@Body() dto: CreateSpellDto, @Request() req) {
    const user = req.user!;
    const command = CreateSpellDto.toCommand(dto, user.id as string, user.roles as string[]);
    const entity = await this.commandBus.execute<CreateSpellCommand, Spell>(command);
    return SpellDto.fromEntity(entity);
  }

  @Patch(':id')
  @ApiOperation({ operationId: 'updateSpell', summary: 'Update spell' })
  @ApiOkResponse({ type: SpellDto, description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  @ApiNotFoundResponse({ description: 'Spell not found', type: ErrorDto })
  @ApiResponse({ status: 400, description: 'Bad request, invalid data', type: ErrorDto })
  async updateSettings(@Param('id') id: string, @Body() dto: UpdateSpellDto, @Request() req) {
    const user = req.user!;
    const command = UpdateSpellDto.toCommand(id, dto, user.id as string, user.roles as string[]);
    const entity = await this.commandBus.execute<UpdateSpellCommand, Spell>(command);
    return SpellDto.fromEntity(entity);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteSpell', summary: 'Delete spell by id' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  @ApiNotFoundResponse({ description: 'Spell not found', type: ErrorDto })
  async delete(@Param('id') id: string, @Request() req) {
    const userId: string = req.user!.id as string;
    const roles: string[] = req.user!.roles as string[];
    const command = new DeleteSpellCommand(id, userId, roles);
    await this.commandBus.execute(command);
  }
}

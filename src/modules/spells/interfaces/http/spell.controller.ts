import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../shared/infrastructure/security/jwt-auth.guard';
import { ApiErrors } from '../../../shared/interfaces/http/api-errors.decorator';
import type { AuthenticatedUser } from '../../../shared/interfaces/http/authenticated-request';
import { CurrentUser } from '../../../shared/interfaces/http/current-user.decorator';
import { SpellDto, SpellPageDto } from './dto/spell.dto';
import { CreateSpellDto } from './dto/create-spell.dto';
import { UpdateSpellDto } from './dto/update-spell.dto';
import { CreateSpellCommand } from '../../application/cqrs/commands/create-spell.command';
import { DeleteSpellCommand } from '../../application/cqrs/commands/delete-spell.command';
import { UpdateSpellCommand } from '../../application/cqrs/commands/update-spell.command';
import { Page } from '../../../shared/application/pagination/page';
import { PagedQueryDto } from '../../../shared/interfaces/http/dto/paged-rsql-query';
import { GetSpellQuery } from '../../application/cqrs/queries/get-spell.query';
import { GetSpellsQuery } from '../../application/cqrs/queries/get-spells.query';
import { Spell } from '../../domain/aggregates/spell';

@UseGuards(JwtAuthGuard)
@Controller('v1/spells')
@ApiTags('Spells')
export class SpellController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get(':id')
  @ApiOperation({ operationId: 'findSpellById', summary: 'Find spell by id' })
  @ApiOkResponse({ type: SpellDto, description: 'Success' })
  @ApiErrors({ 404: 'Spell not found' })
  async findById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const userId = user.id;
    const roles = user.roles;
    const query = new GetSpellQuery(id, userId, roles);
    const entity = await this.queryBus.execute<GetSpellQuery, Spell>(query);
    return SpellDto.fromEntity(entity);
  }

  @Get('')
  @ApiOperation({ operationId: 'findSpells', summary: 'Find spells by RSQL' })
  @ApiOkResponse({ type: SpellPageDto, description: 'Success' })
  @ApiErrors({ 400: 'Invalid RSQL query' })
  async find(@Query() dto: PagedQueryDto, @CurrentUser() user: AuthenticatedUser) {
    const userId: string = user.id;
    const roles: string[] = user.roles;
    const query = new GetSpellsQuery(dto.q, dto.page, dto.size, userId, roles);
    const page = await this.queryBus.execute<GetSpellsQuery, Page<Spell>>(query);
    const mapped = page.content.map(spell => SpellDto.fromEntity(spell));
    return new Page<SpellDto>(mapped, page.pagination.page, page.pagination.size, page.pagination.totalElements);
  }

  @Post('')
  @ApiBody({ type: CreateSpellDto })
  @ApiOperation({ operationId: 'createSpell', summary: 'Create a new spell' })
  @ApiOkResponse({ type: SpellDto, description: 'Success' })
  @ApiErrors({ 400: 'Bad request, invalid data', 409: 'Conflict, spell list already exists' })
  async create(@Body() dto: CreateSpellDto, @CurrentUser() user: AuthenticatedUser) {
    const command = CreateSpellDto.toCommand(dto, user.id, user.roles);
    const entity = await this.commandBus.execute<CreateSpellCommand, Spell>(command);
    return SpellDto.fromEntity(entity);
  }

  @Patch(':id')
  @ApiOperation({ operationId: 'updateSpell', summary: 'Update spell' })
  @ApiOkResponse({ type: SpellDto, description: 'Success' })
  @ApiErrors({ 404: 'Spell not found', 400: 'Bad request, invalid data' })
  async updateSettings(@Param('id') id: string, @Body() dto: UpdateSpellDto, @CurrentUser() user: AuthenticatedUser) {
    const command = UpdateSpellDto.toCommand(id, dto, user.id, user.roles);
    const entity = await this.commandBus.execute<UpdateSpellCommand, Spell>(command);
    return SpellDto.fromEntity(entity);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteSpell', summary: 'Delete spell by id' })
  @ApiErrors({ 404: 'Spell not found' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const userId: string = user.id;
    const roles: string[] = user.roles;
    const command = new DeleteSpellCommand(id, userId, roles);
    await this.commandBus.execute(command);
  }
}

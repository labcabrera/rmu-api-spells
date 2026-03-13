/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/jwt.auth.guard';
import { ErrorDto } from 'src/modules/shared/interfaces/http/dto/error-dto';
import { SPELL_TARGET_TYPES, SpellTargetType } from '../../domain/value-objects/spell-target.vo';

@UseGuards(JwtAuthGuard)
@Controller('v1/target-types')
@ApiTags('Target types')
export class SpellTargetTypeController {
  @Get()
  @ApiOperation({ operationId: 'findSpellTargetTypes', summary: 'Find spell target types' })
  @ApiOkResponse({ type: [String], description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  findTargetTypes(): SpellTargetType[] {
    return SPELL_TARGET_TYPES;
  }
}

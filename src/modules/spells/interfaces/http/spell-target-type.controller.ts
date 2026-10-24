import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/infrastructure/security/jwt-auth.guard.js';
import { ApiErrors } from '../../../shared/interfaces/http/api-errors.decorator.js';
import { SPELL_TARGET_TYPES, type SpellTargetType } from '../../domain/value-objects/spell-target.vo.js';

@UseGuards(JwtAuthGuard)
@Controller('v1/target-types')
@ApiTags('Target types')
export class SpellTargetTypeController {
  @Get()
  @ApiOperation({ operationId: 'findSpellTargetTypes', summary: 'Find spell target types' })
  @ApiOkResponse({ type: [String], description: 'Success' })
  @ApiErrors()
  findTargetTypes(): SpellTargetType[] {
    return SPELL_TARGET_TYPES;
  }
}

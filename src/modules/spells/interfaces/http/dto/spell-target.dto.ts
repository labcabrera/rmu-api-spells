import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsArray, IsIn } from 'class-validator';
import {
  SPELL_TARGET_MODES,
  SPELL_TARGET_TYPES,
  type SpellTargetMode,
  type SpellTargetType,
} from '../../../domain/value-objects/spell-target.vo.js';
import { SpellTarget } from '../../../domain/value-objects/spell-target.vo.js';

export class SpellTargetDto {
  @ApiProperty({ type: String, enum: SPELL_TARGET_MODES, example: 'target' })
  @IsIn(SPELL_TARGET_MODES)
  mode: SpellTargetMode;

  @ApiPropertyOptional({ type: [String], enum: SPELL_TARGET_TYPES, nullable: true, example: ['person'] })
  @IsOptional()
  @IsArray()
  @IsIn(SPELL_TARGET_TYPES, { each: true })
  types: SpellTargetType[] | null;

  @ApiPropertyOptional({ type: Number, nullable: true, example: 1 })
  @IsOptional()
  @IsNumber()
  count: number | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'adjacent' })
  @IsOptional()
  @IsString()
  modifier: string | null;

  static fromEntity(entity: SpellTarget): SpellTargetDto {
    const dto = new SpellTargetDto();
    dto.mode = entity.mode;
    dto.types = entity.types;
    dto.count = entity.count;
    dto.modifier = entity.modifier;
    return dto;
  }

  static toEntity(dto: SpellTargetDto): SpellTarget {
    return new SpellTarget(dto.mode, dto.types ?? null, dto.count ?? null, dto.modifier ?? null);
  }
}

export default SpellTargetDto;

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { SPELL_RANGE_TYPES, type SpellRangeType } from '../../../domain/value-objects/spell-range-type.vo.js';
import { SpellRange } from '../../../domain/value-objects/spell-range.vo.js';

export class SpellRangeDto {
  @ApiProperty({ type: String, enum: SPELL_RANGE_TYPES, example: 'distance' })
  @IsIn(SPELL_RANGE_TYPES)
  type: SpellRangeType;

  @ApiPropertyOptional({ type: Number, nullable: true, example: 10 })
  @IsOptional()
  @IsNumber()
  value: number | null;

  static fromEntity(entity: SpellRange): SpellRangeDto {
    const dto = new SpellRangeDto();
    dto.type = entity.type;
    dto.value = entity.value;
    return dto;
  }

  static toEntity(dto: SpellRangeDto): SpellRange {
    return new SpellRange(dto.type, dto.value ?? null);
  }
}

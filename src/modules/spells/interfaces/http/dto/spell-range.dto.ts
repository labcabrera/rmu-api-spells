import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { SPELL_RANGE_TYPES, type SpellRangeType } from '../../../domain/value-objects/spell-range-type.vo.js';
import { SpellRange } from '../../../domain/value-objects/spell-range.vo.js';

/** Range of a spell (spec 028). Distances are in feet. */
export class SpellRangeDto {
  @ApiProperty({ type: String, enum: SPELL_RANGE_TYPES, example: 'distance' })
  @IsIn(SPELL_RANGE_TYPES)
  type: SpellRangeType;

  @ApiPropertyOptional({ type: Number, nullable: true, description: 'Distance in feet', example: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  value: number | null;

  @ApiPropertyOptional({ type: Boolean, description: 'The distance is per level of the caster', example: false })
  @IsOptional()
  @IsBoolean()
  perLevel: boolean | undefined;

  @ApiPropertyOptional({ type: Number, nullable: true, description: "Range increment of a directed spell, in feet (<25'>)", example: 25 })
  @IsOptional()
  @IsInt()
  @Min(0)
  increment: number | null;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Text of the book it comes from', example: "100'" })
  @IsOptional()
  @IsString()
  raw: string | null;

  static fromEntity(entity: SpellRange): SpellRangeDto {
    return Object.assign(new SpellRangeDto(), entity);
  }
}

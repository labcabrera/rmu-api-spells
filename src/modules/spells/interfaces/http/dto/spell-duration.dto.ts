import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { SPELL_DURATION_SCALES, type SpellDurationScale } from '../../../domain/value-objects/spell-duration-scale.vo.js';
import { SPELL_DURATION_TYPES, type SpellDurationType } from '../../../domain/value-objects/spell-duration-type.vo.js';
import { SpellDuration } from '../../../domain/value-objects/spell-duration.vo.js';

/** Duration of a spell (spec 028): `value` `scale` per `perLevel` levels or per `perFailure` points of RR failure. */
export class SpellDurationDto {
  @ApiProperty({ type: String, enum: SPELL_DURATION_TYPES, example: 'per-level' })
  @IsIn(SPELL_DURATION_TYPES)
  type: SpellDurationType;

  @ApiPropertyOptional({ type: Number, nullable: true, example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  value: number | null;

  @ApiPropertyOptional({ type: String, enum: SPELL_DURATION_SCALES, nullable: true, example: 'minute' })
  @IsOptional()
  @IsIn(SPELL_DURATION_SCALES)
  scale: SpellDurationScale | null;

  @ApiPropertyOptional({ type: Number, nullable: true, description: 'Levels per step: 1 (per level), 5 (per 5 levels)…', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  perLevel: number | null;

  @ApiPropertyOptional({ type: Number, nullable: true, description: 'Points of RR failure per step: 1, 3, 5, 10', example: null })
  @IsOptional()
  @IsInt()
  @Min(1)
  perFailure: number | null;

  @ApiPropertyOptional({ type: Boolean, description: 'Needs concentration', example: false })
  @IsOptional()
  @IsBoolean()
  concentration: boolean | undefined;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Text of the book it comes from', example: '1 min/lvl' })
  @IsOptional()
  @IsString()
  raw: string | null;

  static fromEntity(entity: SpellDuration): SpellDurationDto {
    return Object.assign(new SpellDurationDto(), entity);
  }
}

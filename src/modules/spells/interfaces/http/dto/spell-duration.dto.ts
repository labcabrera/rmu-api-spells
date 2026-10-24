import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { SPELL_DURATION_SCALES, type SpellDurationScale } from '../../../domain/value-objects/spell-duration-scale.vo.js';
import { SPELL_DURATION_TYPES, type SpellDurationType } from '../../../domain/value-objects/spell-duration-type.vo.js';
import { SpellDuration } from '../../../domain/value-objects/spell-duration.vo.js';

export class SpellDurationDto {
  // Optional: rmu-mfe-spells sends a duration without type when only requiredConcentration is set.
  @ApiPropertyOptional({ type: String, enum: SPELL_DURATION_TYPES, nullable: true })
  @IsOptional()
  @IsIn(SPELL_DURATION_TYPES)
  type: SpellDurationType | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  @IsOptional()
  @IsNumber()
  duration: number | null;

  @ApiPropertyOptional({ type: String, enum: SPELL_DURATION_SCALES, nullable: true })
  @IsOptional()
  @IsIn(SPELL_DURATION_SCALES)
  durationScale: SpellDurationScale | null;

  @ApiPropertyOptional({ type: Boolean, nullable: true })
  @IsOptional()
  @IsBoolean()
  requiredConcentration: boolean | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  @IsOptional()
  @IsNumber()
  failureScale: number | null;

  static fromEntity(duration: SpellDuration): SpellDurationDto {
    const dto = new SpellDurationDto();
    dto.type = duration.type;
    dto.duration = duration.duration;
    dto.durationScale = duration.durationScale;
    dto.requiredConcentration = duration.requiredConcentration;
    dto.failureScale = duration.failureScale;
    return dto;
  }

  static toEntity(dto: SpellDurationDto): SpellDuration {
    return new SpellDuration(
      dto.type ?? null,
      dto.duration ?? null,
      dto.durationScale ?? null,
      dto.requiredConcentration ?? null,
      dto.failureScale ?? null,
    );
  }
}

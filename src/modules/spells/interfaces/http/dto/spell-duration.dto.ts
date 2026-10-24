import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { SpellDurationScale } from '../../../domain/value-objects/spell-duration-scale.vo';
import type { SpellDurationType } from '../../../domain/value-objects/spell-duration-type.vo';
import { SpellDuration } from '../../../domain/value-objects/spell-duration.vo';

export class SpellDurationDto {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  type: SpellDurationType;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
  @IsNumber()
  duration: number | null;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  durationScale: SpellDurationScale | null;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  requiredConcentration: boolean | null;

  @ApiProperty({ type: Number, required: false })
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
    return new SpellDuration(dto.type, dto.duration, dto.durationScale, dto.requiredConcentration, dto.failureScale);
  }
}

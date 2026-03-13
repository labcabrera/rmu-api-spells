import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { SpellDurationScale } from 'src/modules/spells/domain/value-objects/spell-duration-scale.vo';
import type { SpellDurationType } from 'src/modules/spells/domain/value-objects/spell-duration-type.vo';
import { SpellDuration } from 'src/modules/spells/domain/value-objects/spell-duration.vo';

export class SpellDurationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  type: SpellDurationType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  duration: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  durationScale: SpellDurationScale | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  requiredConcentration: boolean | null;

  static fromEntity(duration: SpellDuration): SpellDurationDto {
    const dto = new SpellDurationDto();
    dto.type = duration.type;
    dto.duration = duration.duration;
    dto.durationScale = duration.durationScale;
    dto.requiredConcentration = duration.requiredConcentration;
    return dto;
  }

  static toEntity(dto: SpellDurationDto): SpellDuration {
    return new SpellDuration(dto.type, dto.duration, dto.durationScale, dto.requiredConcentration);
  }
}

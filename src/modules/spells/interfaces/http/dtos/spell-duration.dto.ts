import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
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
  duration: number | undefined;

  @ApiProperty({ required: false })
  @IsOptional()
  durationScale: SpellDurationScale | undefined;

  static toEntity(dto: SpellDurationDto): SpellDuration {
    return new SpellDuration(dto.type, dto.duration, dto.durationScale);
  }
}

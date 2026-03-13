import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import type { SpellRangeType } from 'src/modules/spells/domain/value-objects/spell-range-type.vo';
import { SpellRange } from 'src/modules/spells/domain/value-objects/spell-range.vo';

export class SpellRangeDto {
  @ApiProperty({ required: true, example: 'distance' })
  @IsString()
  type: SpellRangeType;

  @ApiProperty({ required: false, example: 10 })
  @IsNumber()
  value: number | null;

  static fromEntity(entity: SpellRange): SpellRangeDto {
    const dto = new SpellRangeDto();
    dto.type = entity.type;
    dto.value = entity.value;
    return dto;
  }

  static toEntity(dto: SpellRangeDto): SpellRange {
    return new SpellRange(dto.type, dto.value);
  }
}

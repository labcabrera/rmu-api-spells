import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { SpellModifiers } from 'src/modules/spells/domain/value-objects/spell-modifiers.vo';
import { SpellDurationDto } from './spell-duration.dto';
import type { SpellType } from 'src/modules/spells/domain/value-objects/spell-type.vo';
import { SpellSubtype as SpellSubtype } from 'src/modules/spells/domain/value-objects/spell-subtype.vo';
import { SpellRangeDto } from './spell-range.dto';

export class SpellModifiersDto {
  @ApiProperty({ required: true, example: 'elemental' })
  type: SpellType;

  @ApiProperty({ required: false, example: 'ball' })
  @IsOptional()
  subtype: SpellSubtype | null;

  @ApiProperty({ required: false, type: SpellRangeDto })
  @IsOptional()
  range: SpellRangeDto | null;

  @ApiProperty({ required: false, type: SpellDurationDto })
  @IsOptional()
  duration: SpellDurationDto | null;

  @ApiProperty({ required: false, type: String, example: "20' x 20'" })
  @IsOptional()
  area: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  rrModifier: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  instant: boolean | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  notRequiredPowerPoints: boolean | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  partOfSetOfSpells: boolean | null;

  static fromEntity(entity: SpellModifiers): SpellModifiersDto {
    const dto = new SpellModifiersDto();
    dto.type = entity.type;
    dto.subtype = entity.subtype;
    dto.range = entity.range ? SpellRangeDto.fromEntity(entity.range) : null;
    dto.duration = entity.duration ? SpellDurationDto.fromEntity(entity.duration) : null;
    dto.area = entity.area;
    dto.rrModifier = entity.rrModifier;
    dto.instant = entity.instant;
    dto.notRequiredPowerPoints = entity.notRequiredPowerPoints;
    dto.partOfSetOfSpells = entity.partOfSetOfSpells;
    return dto;
  }

  static toEntity(dto: SpellModifiersDto): SpellModifiers {
    return new SpellModifiers(
      dto.type,
      dto.subtype,
      dto.range ? SpellRangeDto.toEntity(dto.range) : null,
      dto.duration ? SpellDurationDto.toEntity(dto.duration) : null,
      dto.area,
      dto.rrModifier,
      dto.instant,
      dto.notRequiredPowerPoints,
      dto.partOfSetOfSpells,
    );
  }
}

export default SpellModifiersDto;

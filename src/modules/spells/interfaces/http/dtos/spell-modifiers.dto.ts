import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { SpellModifiers } from 'src/modules/spells/domain/value-objects/spell-modifiers.vo';
import { SpellDurationDto } from './spell-duration.dto';
import { SpellType } from 'src/modules/spells/domain/value-objects/spell-type.vo';
import { SpellSubType } from 'src/modules/spells/domain/value-objects/spell-subtype.vo';

export class SpellModifiersDto {
  @ApiProperty({ required: false })
  @IsOptional()
  type: SpellType | undefined;

  @ApiProperty({ required: false })
  @IsOptional()
  subType: SpellSubType | undefined;

  @ApiProperty({ required: false, type: SpellDurationDto })
  @IsOptional()
  duration: SpellDurationDto | undefined;

  @ApiProperty({ required: false })
  @IsOptional()
  area: string | undefined;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  rrModifier: number | undefined;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  instant: boolean | undefined;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  notRequiredPowerPoints: boolean | undefined;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  partOfSetOfSpells: boolean | undefined;

  static fromEntity(entity: SpellModifiers): SpellModifiersDto {
    const dto = new SpellModifiersDto();
    dto.type = entity.type;
    dto.subType = entity.subType;
    dto.duration = entity.duration;
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
      dto.subType,
      dto.duration ? SpellDurationDto.toEntity(dto.duration) : undefined,
      dto.area,
      dto.rrModifier,
      dto.instant,
      dto.notRequiredPowerPoints,
      dto.partOfSetOfSpells,
    );
  }
}

export default SpellModifiersDto;

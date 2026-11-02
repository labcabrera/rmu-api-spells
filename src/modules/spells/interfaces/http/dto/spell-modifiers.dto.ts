import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Matches, Min, ValidateNested } from 'class-validator';
import { SpellModifiers } from '../../../domain/value-objects/spell-modifiers.vo.js';
import { SPELL_TYPES, type SpellType } from '../../../domain/value-objects/spell-type.vo.js';
import { SPELL_SUBTYPES, type SpellSubtype } from '../../../domain/value-objects/spell-subtype.vo.js';
import { SpellAreaDto } from './spell-area.dto.js';
import { SpellDurationDto } from './spell-duration.dto.js';
import { SpellRangeDto } from './spell-range.dto.js';
import { SpellResistanceDto } from './spell-resistance.dto.js';

/**
 * How a spell is cast and what it reaches (spec 028). Every field is optional. In a PATCH, a field that is sent
 * replaces the stored one (null clears it) and the others stay.
 */
export class SpellModifiersDto {
  @ApiPropertyOptional({ type: String, nullable: true, description: 'Type code as printed in the book', example: 'Fm' })
  @IsOptional()
  @IsString()
  @Matches(/^[EFIUA][bdms]?$/)
  typeCode: string | null;

  @ApiPropertyOptional({ type: String, enum: SPELL_TYPES, nullable: true, example: 'elemental' })
  @IsOptional()
  @IsIn(SPELL_TYPES)
  type: SpellType | null;

  @ApiPropertyOptional({ type: String, enum: SPELL_SUBTYPES, nullable: true, example: 'ball' })
  @IsOptional()
  @IsIn(SPELL_SUBTYPES)
  subtype: SpellSubtype | null;

  @ApiPropertyOptional({ type: Boolean, description: 'Instantaneous (*)', example: false })
  @IsOptional()
  @IsBoolean()
  instant: boolean | undefined;

  @ApiPropertyOptional({ type: Number, nullable: true, description: 'Power points it costs: null is the level, 0 for the spells marked •' })
  @IsOptional()
  @IsInt()
  @Min(0)
  powerPoints: number | null;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Set of spells cast together (‡)', example: null })
  @IsOptional()
  @IsString()
  setGroup: string | null;

  @ApiPropertyOptional({ type: SpellRangeDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => SpellRangeDto)
  range: SpellRangeDto | null;

  @ApiPropertyOptional({ type: SpellAreaDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => SpellAreaDto)
  area: SpellAreaDto | null;

  @ApiPropertyOptional({ type: SpellDurationDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => SpellDurationDto)
  duration: SpellDurationDto | null;

  @ApiPropertyOptional({ type: SpellResistanceDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => SpellResistanceDto)
  resistance: SpellResistanceDto | null;

  static fromEntity(entity: SpellModifiers): SpellModifiersDto {
    const dto = new SpellModifiersDto();
    dto.typeCode = entity.typeCode;
    dto.type = entity.type;
    dto.subtype = entity.subtype;
    dto.instant = entity.instant;
    dto.powerPoints = entity.powerPoints;
    dto.setGroup = entity.setGroup;
    dto.range = entity.range ? SpellRangeDto.fromEntity(entity.range) : null;
    dto.area = entity.area ? SpellAreaDto.fromEntity(entity.area) : null;
    dto.duration = entity.duration ? SpellDurationDto.fromEntity(entity.duration) : null;
    dto.resistance = entity.resistance ? SpellResistanceDto.fromEntity(entity.resistance) : null;
    return dto;
  }

  /** The modifiers of a new spell: what is not sent is empty. */
  static toEntity(dto: SpellModifiersDto): SpellModifiers {
    return SpellModifiers.empty().merge(SpellModifiersDto.toPatch(dto));
  }

  /** Only the fields that were sent: null clears a field, a missing one keeps it. */
  static toPatch(dto: SpellModifiersDto): Partial<SpellModifiers> {
    const sent = Object.fromEntries(Object.entries(dto).filter(([, value]) => value !== undefined));
    // The nested objects become value objects through fromPlain, which fills their defaults.
    const built = SpellModifiers.fromPlain(sent) as unknown as Record<string, unknown>;
    return Object.fromEntries(Object.keys(sent).map(key => [key, built[key]]));
  }
}

export default SpellModifiersDto;

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsNumber, IsBoolean, IsIn, ValidateNested } from 'class-validator';
import { SpellModifiers } from '../../../domain/value-objects/spell-modifiers.vo.js';
import { SpellDurationDto } from './spell-duration.dto.js';
import { SPELL_TYPES, type SpellType } from '../../../domain/value-objects/spell-type.vo.js';
import { SPELL_SUBTYPES, type SpellSubtype } from '../../../domain/value-objects/spell-subtype.vo.js';
import { SpellRangeDto } from './spell-range.dto.js';
import SpellTargetDto from './spell-target.dto.js';

/**
 * The modifiers of a spell. Every field is optional: rmu-mfe-spells creates spells with `modifiers: {}` and fills the
 * fields the user picks. In a PATCH, a field that is sent replaces the stored one (null clears it) and the others stay.
 */
export class SpellModifiersDto {
  @ApiPropertyOptional({ type: String, enum: SPELL_TYPES, nullable: true, example: 'elemental' })
  @IsOptional()
  @IsIn(SPELL_TYPES)
  type: SpellType | null;

  @ApiPropertyOptional({ type: String, enum: SPELL_SUBTYPES, nullable: true, example: 'ball' })
  @IsOptional()
  @IsIn(SPELL_SUBTYPES)
  subtype: SpellSubtype | null;

  @ApiPropertyOptional({ type: SpellRangeDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => SpellRangeDto)
  range: SpellRangeDto | null;

  @ApiPropertyOptional({ type: SpellDurationDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => SpellDurationDto)
  duration: SpellDurationDto | null;

  @ApiPropertyOptional({ type: SpellTargetDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => SpellTargetDto)
  target: SpellTargetDto | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  @IsOptional()
  @IsNumber()
  rrModifier: number | null;

  @ApiPropertyOptional({ type: Boolean, nullable: true })
  @IsOptional()
  @IsBoolean()
  instant: boolean | null;

  @ApiPropertyOptional({ type: Boolean, nullable: true })
  @IsOptional()
  @IsBoolean()
  notRequiredPowerPoints: boolean | null;

  @ApiPropertyOptional({ type: Boolean, nullable: true })
  @IsOptional()
  @IsBoolean()
  partOfSetOfSpells: boolean | null;

  static fromEntity(entity: SpellModifiers): SpellModifiersDto {
    const dto = new SpellModifiersDto();
    dto.type = entity.type;
    dto.subtype = entity.subtype;
    dto.range = entity.range ? SpellRangeDto.fromEntity(entity.range) : null;
    dto.duration = entity.duration ? SpellDurationDto.fromEntity(entity.duration) : null;
    dto.target = entity.target ? SpellTargetDto.fromEntity(entity.target) : null;
    dto.rrModifier = entity.rrModifier;
    dto.instant = entity.instant;
    dto.notRequiredPowerPoints = entity.notRequiredPowerPoints;
    dto.partOfSetOfSpells = entity.partOfSetOfSpells;
    return dto;
  }

  /** The modifiers of a new spell: what is not sent is empty. */
  static toEntity(dto: SpellModifiersDto): SpellModifiers {
    return SpellModifiers.empty().merge(SpellModifiersDto.toPatch(dto));
  }

  /** Only the fields that were sent: null clears a field, a missing one keeps it. */
  static toPatch(dto: SpellModifiersDto): Partial<SpellModifiers> {
    const patch: Partial<SpellModifiers> = {
      type: dto.type,
      subtype: dto.subtype,
      range: dto.range ? SpellRangeDto.toEntity(dto.range) : dto.range,
      duration: dto.duration ? SpellDurationDto.toEntity(dto.duration) : dto.duration,
      target: dto.target ? SpellTargetDto.toEntity(dto.target) : dto.target,
      rrModifier: dto.rrModifier,
      instant: dto.instant,
      notRequiredPowerPoints: dto.notRequiredPowerPoints,
      partOfSetOfSpells: dto.partOfSetOfSpells,
    };
    return Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined));
  }
}

export default SpellModifiersDto;

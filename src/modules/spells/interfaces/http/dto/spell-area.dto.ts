import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { SPELL_AREA_KINDS, SPELL_TARGET_TYPES, SpellArea, type SpellAreaKind } from '../../../domain/value-objects/spell-area.vo.js';

/** Area of effect of a spell (spec 028): replaces the target. Distances are in feet. */
export class SpellAreaDto {
  @ApiProperty({ type: String, enum: SPELL_AREA_KINDS, example: 'targets' })
  @IsIn(SPELL_AREA_KINDS)
  kind: SpellAreaKind;

  @ApiPropertyOptional({ type: Number, nullable: true, example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  count: number | null;

  @ApiPropertyOptional({ type: Boolean, description: 'The count or the radius is per level of the caster', example: false })
  @IsOptional()
  @IsBoolean()
  perLevel: boolean | undefined;

  @ApiPropertyOptional({ type: Number, nullable: true, description: 'Radius in feet', example: null })
  @IsOptional()
  @IsInt()
  @Min(0)
  radius: number | null;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Volumes and compound measures', example: null })
  @IsOptional()
  @IsString()
  dimensions: string | null;

  @ApiPropertyOptional({ type: [String], description: 'Kinds of target (GET /v1/target-types)', example: ['person'] })
  @IsOptional()
  @IsArray()
  @IsIn(SPELL_TARGET_TYPES, { each: true })
  targetTypes: string[] | undefined;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Text of the book it comes from', example: '1 target' })
  @IsOptional()
  @IsString()
  raw: string | null;

  static fromEntity(entity: SpellArea): SpellAreaDto {
    return Object.assign(new SpellAreaDto(), entity);
  }
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional } from 'class-validator';
import {
  SPELL_RESISTANCE_KINDS,
  SPELL_RESISTANCE_SCALINGS,
  SpellResistance,
  type SpellResistanceKind,
  type SpellResistanceScaling,
} from '../../../domain/value-objects/spell-resistance.vo.js';

/** The resistance roll of a spell (spec 028). */
export class SpellResistanceDto {
  @ApiProperty({ type: String, enum: SPELL_RESISTANCE_KINDS, example: 'realm' })
  @IsIn(SPELL_RESISTANCE_KINDS)
  kind: SpellResistanceKind;

  @ApiPropertyOptional({ type: Number, nullable: true, description: 'RR modifier ([RR Mod: #])', example: -20 })
  @IsOptional()
  @IsInt()
  modifier: number | null;

  @ApiPropertyOptional({ type: String, enum: SPELL_RESISTANCE_SCALINGS, example: 'all-or-nothing' })
  @IsOptional()
  @IsIn(SPELL_RESISTANCE_SCALINGS)
  scaling: SpellResistanceScaling | undefined;

  static fromEntity(entity: SpellResistance): SpellResistanceDto {
    return Object.assign(new SpellResistanceDto(), entity);
  }
}

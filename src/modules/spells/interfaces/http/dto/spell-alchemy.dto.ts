import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDefined, IsIn, IsNumber, IsObject, IsOptional, ValidateNested } from 'class-validator';
import {
  ALCHEMY_FAILURE_TABLES,
  SPELL_ALCHEMY_EFFECT_KINDS,
  SpellAlchemy,
  type AlchemyFailureTable,
  type SpellAlchemyEffectKind,
} from '../../../domain/value-objects/spell-alchemy.vo.js';

/** What an alchemical spell adds to the item (spec 064). */
export class SpellAlchemyEffectDto {
  @ApiProperty({ type: String, enum: SPELL_ALCHEMY_EFFECT_KINDS, example: 'attack' })
  @IsIn(SPELL_ALCHEMY_EFFECT_KINDS)
  kind: SpellAlchemyEffectKind;

  @ApiProperty({ type: Number, description: 'Bonus, number of spells or multiplier (1.25 for a pp-multiplier)', example: 10 })
  @IsDefined()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  value: number;
}

/** Alchemy metadata of a spell (spec 064): how it is embedded in an item. */
export class SpellAlchemyDto {
  @ApiProperty({ type: String, enum: ALCHEMY_FAILURE_TABLES, description: 'Table rolled on when its SCR fails', example: 'bonus' })
  @IsIn(ALCHEMY_FAILURE_TABLES)
  failureTable: AlchemyFailureTable;

  @ApiProperty({ type: Boolean, description: 'In a batch it is cast once per unit', example: false })
  @IsDefined()
  @IsBoolean()
  perItem: boolean;

  @ApiProperty({ type: Boolean, description: 'It creates or alters the base item (mark # of the book)', example: false })
  @IsDefined()
  @IsBoolean()
  alters: boolean;

  @ApiPropertyOptional({
    type: () => SpellAlchemyEffectDto,
    nullable: true,
    description: 'What it adds to the item; null if nothing numeric',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SpellAlchemyEffectDto)
  effect: SpellAlchemyEffectDto | null;

  static toEntity(dto: SpellAlchemyDto | null | undefined): SpellAlchemy | null {
    if (!dto) return null;
    return SpellAlchemy.fromPlain(dto as unknown as Record<string, unknown>);
  }

  static fromEntity(entity: SpellAlchemy | null): SpellAlchemyDto | null {
    if (!entity) return null;
    const dto = Object.assign(new SpellAlchemyDto(), entity);
    dto.effect = entity.effect ? Object.assign(new SpellAlchemyEffectDto(), entity.effect) : null;
    return dto;
  }
}

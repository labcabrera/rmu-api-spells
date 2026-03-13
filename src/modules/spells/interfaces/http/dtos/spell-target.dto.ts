import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';
import type { SpellTargetMode, SpellTargetType } from 'src/modules/spells/domain/value-objects/spell-target.vo';
import { SpellTarget } from 'src/modules/spells/domain/value-objects/spell-target.vo';

export class SpellTargetDto {
  @ApiProperty({ required: true, example: 'target' })
  @IsString()
  mode: SpellTargetMode;

  @ApiProperty({ required: false, type: [String], example: ['person'] })
  @IsOptional()
  @IsArray()
  types: SpellTargetType[] | null;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsNumber()
  count: number | null;

  @ApiProperty({ required: false, example: 'adjacent' })
  @IsOptional()
  @IsString()
  modifier: string | null;

  static fromEntity(entity: SpellTarget): SpellTargetDto {
    const dto = new SpellTargetDto();
    dto.mode = entity.mode;
    dto.types = entity.types;
    dto.count = entity.count;
    dto.modifier = entity.modifier;
    return dto;
  }

  static toEntity(dto: SpellTargetDto): SpellTarget {
    return new SpellTarget(dto.mode, dto.types, dto.count, dto.modifier);
  }
}

export default SpellTargetDto;

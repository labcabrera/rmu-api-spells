import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { SpellModifiersDto } from './spell-modifiers.dto.js';
import { UpdateSpellCommand } from '../../../application/cqrs/commands/update-spell.command.js';
import type { SpellEffect } from '../../../domain/value-objects/spell-effect.vo.js';
import type { AccessType } from '../../../../shared/domain/entities/access-type.js';

export class UpdateSpellDto {
  @ApiPropertyOptional({ type: String, description: 'Name of the spell', example: 'Fireball' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string | undefined;

  @ApiPropertyOptional({ type: Number, description: 'Level of the spell', example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  level: number | undefined;

  @ApiPropertyOptional({ type: String, description: 'List the spell moves to: it must exist and be one of the lists of the user' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  spellListId: string | undefined;

  @ApiPropertyOptional({
    description: 'Modifiers to change: the fields sent replace the stored ones (null clears one), the others stay',
    type: SpellModifiersDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SpellModifiersDto)
  modifiers: SpellModifiersDto | undefined;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Id of the spell it is a variant of ("as X, but…"): null clears it' })
  @IsOptional()
  @IsString()
  basedOn: string | null | undefined;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'object' },
    description:
      'What the spell does to its targets (spec 028): attack, critical, damage, heal, condition, modifier, afflict, cure…: the list sent replaces every effect',
  })
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  effects: SpellEffect[] | undefined;

  @ApiProperty({ type: String, description: 'Access type of the spell', required: false, example: 'public', enum: ['public', 'private'] })
  @IsString()
  @IsIn(['public', 'private'])
  @IsOptional()
  accessType: AccessType | undefined;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Description of the spell: an empty string or null clears it',
    example: 'A detailed description of the fireball spell',
  })
  @IsString()
  @IsOptional()
  description: string | null | undefined;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Image URL of the spell: an empty string or null clears it',
    example: 'https://example.com/images/spells/fireball.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl: string | null | undefined;

  @ApiPropertyOptional({ description: 'Version the client read (from the GET); a different stored version is a 409', example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  version?: number;

  static toCommand(id: string, dto: UpdateSpellDto, user: string, roles: string[], authorization?: string) {
    return new UpdateSpellCommand(
      id,
      dto.name,
      dto.level,
      dto.modifiers ? SpellModifiersDto.toPatch(dto.modifiers) : undefined,
      dto.accessType,
      dto.description,
      dto.imageUrl,
      user,
      roles,
      dto.version,
      dto.spellListId,
      dto.basedOn,
      dto.effects,
      authorization,
    );
  }
}

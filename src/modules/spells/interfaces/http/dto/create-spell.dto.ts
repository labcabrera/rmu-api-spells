import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsIn, IsDefined, IsObject, Min, ValidateNested } from 'class-validator';
import { CreateSpellCommand } from '../../../application/cqrs/commands/create-spell.command.js';
import SpellModifiersDto from './spell-modifiers.dto.js';
import type { AccessType } from '../../../../shared/domain/entities/access-type.js';

export class CreateSpellDto {
  @ApiProperty({ description: 'Id of the spell list: one of the lists of the user (or any list for an admin)' })
  @IsString()
  @IsNotEmpty()
  spellListId: string;

  @ApiProperty({ description: 'Name of the spell', example: 'Some name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Level of the spell', example: 1 })
  @IsInt()
  @Min(1)
  level: number;

  @ApiProperty({ description: 'Modifiers for the spell', type: SpellModifiersDto })
  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => SpellModifiersDto)
  modifiers: SpellModifiersDto;

  @ApiProperty({ type: String, description: 'Access type of the spell', required: false, example: 'public', enum: ['public', 'private'] })
  @IsString()
  @IsIn(['public', 'private'])
  @IsOptional()
  accessType: AccessType | undefined;

  @ApiProperty({
    type: String,
    description: 'Description of the spell',
    required: false,
    example: 'A detailed description of the spell with all its features and effects',
  })
  @IsString()
  @IsOptional()
  description: string | undefined;

  @ApiProperty({
    type: String,
    description: 'Image URL of the spell',
    required: false,
    example: 'https://example.com/images/spells/some-spell.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl: string | undefined;

  static toCommand(dto: CreateSpellDto, user: string, roles: string[]) {
    return new CreateSpellCommand(
      dto.spellListId,
      dto.name,
      dto.level,
      SpellModifiersDto.toEntity(dto.modifiers),
      dto.accessType ?? 'public',
      dto.description,
      dto.imageUrl,
      user,
      roles,
    );
  }
}

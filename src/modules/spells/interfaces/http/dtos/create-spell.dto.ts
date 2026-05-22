import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn } from 'class-validator';
import { CreateSpellCommand } from 'src/modules/spells/application/cqrs/commands/create-spell.command';
import SpellModifiersDto from './spell-modifiers.dto';
import { AccessType } from 'src/modules/shared/domain/entities/access-type';

export class CreateSpellDto {
  @ApiProperty({ description: 'Spell list reference', required: true })
  @IsOptional()
  spellListId: string;

  @ApiProperty({ description: 'Name of the spell', example: 'Some name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Level of the spell', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  level: number;

  @ApiProperty({ description: 'Modifiers for the spell', required: true, type: SpellModifiersDto })
  @IsOptional()
  modifiers: SpellModifiersDto;

  @ApiProperty({ description: 'Access type of the spell', required: false, example: 'public', enum: ['public', 'private'] })
  @IsString()
  @IsIn(['public', 'private'])
  @IsOptional()
  accessType: AccessType | undefined;

  @ApiProperty({
    description: 'Description of the spell',
    required: false,
    example: 'A detailed description of the spell with all its features and effects',
  })
  @IsString()
  @IsOptional()
  description: string | undefined;

  @ApiProperty({
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

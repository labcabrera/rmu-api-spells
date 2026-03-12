import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { SpellModifiersDto } from './spell-modifiers.dto';
import { UpdateSpellCommand } from 'src/modules/spells/application/cqrs/commands/update-spell.command';
import { NamedEntityDto } from 'src/modules/shared/interfaces/http/dto/named-entity.dto';

export class UpdateSpellDto {
  @ApiProperty({ description: 'Name of the spell', example: 'Fireball' })
  @IsString()
  @IsOptional()
  name: string | undefined;

  @ApiProperty({ description: 'Level of the spell', example: 1 })
  @IsNumber()
  @IsOptional()
  level: number | undefined;

  @ApiProperty({ description: 'Short description of the spell', required: false, example: 'A powerful fire spell' })
  @IsOptional()
  spellList: NamedEntityDto | undefined;

  @ApiProperty({ description: 'Modifiers for the spell', required: false, type: SpellModifiersDto })
  @IsOptional()
  modifiers: SpellModifiersDto | undefined;

  @ApiProperty({
    description: 'Description of the spell',
    required: false,
    example: 'A detailed description of the fireball spell',
  })
  @IsString()
  @IsOptional()
  description: string | undefined;

  @ApiProperty({
    description: 'Image URL of the spell',
    required: false,
    example: 'https://example.com/images/spells/fireball.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl: string | undefined;

  static toCommand(id: string, dto: UpdateSpellDto, user: string, roles: string[]) {
    return new UpdateSpellCommand(
      id,
      dto.name,
      dto.level,
      dto.modifiers ? SpellModifiersDto.toEntity(dto.modifiers) : undefined,
      dto.description,
      dto.imageUrl,
      user,
      roles,
    );
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { UpdateSpellListCommand } from 'src/modules/spell-lists/application/cqrs/commands/update-spell-list.command';
import { UpdateSpellCommand } from 'src/modules/spells/application/cqrs/commands/update-spell.command';

export class UpdateSpellDto {
  @ApiProperty({ description: 'Name of the spell', example: 'Fireball' })
  @IsString()
  @IsOptional()
  name: string | undefined;

  @ApiProperty({ description: 'Short description of the spell', required: false, example: 'A powerful fire spell' })
  @IsString()
  @IsOptional()
  shortDescription: string | undefined;

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

  static toCommand(id: string, dto: UpdateSpellDto, userId: string, userRoles: string[]) {
    return new UpdateSpellCommand(id, dto.name, dto.shortDescription, dto.description, dto.imageUrl, userId, userRoles);
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { UpdateSpellListCommand } from 'src/modules/spell-lists/application/cqrs/commands/update-spell-list.command';

export class UpdateSpellListDto {
  @ApiProperty({ description: 'Name of the spell list', example: 'Fireball' })
  @IsString()
  @IsOptional()
  name: string | undefined;

  @ApiProperty({ description: 'Short description of the spell list', required: false, example: 'A powerful fire spell' })
  @IsString()
  @IsOptional()
  shortDescription: string | undefined;

  @ApiProperty({
    description: 'Description of the spell list',
    required: false,
    example: 'A detailed description of the fireball spell list',
  })
  @IsString()
  @IsOptional()
  description: string | undefined;

  @ApiProperty({
    description: 'Image URL of the spell list',
    required: false,
    example: 'https://example.com/images/spell-lists/fireball.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl: string | undefined;

  static toCommand(id: string, dto: UpdateSpellListDto, userId: string, userRoles: string[]) {
    return new UpdateSpellListCommand(id, dto.name, dto.shortDescription, dto.description, dto.imageUrl, userId, userRoles);
  }
}

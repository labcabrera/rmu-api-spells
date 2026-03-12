import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { CreateSpellListCommand } from 'src/modules/spell-lists/application/cqrs/commands/create-spell-list.command';

export class CreateSpellListDto {
  @ApiProperty({ description: 'Name of the spell list', example: 'Some name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Short description of the spell list', required: false, example: 'A brief overview of the spell list' })
  @IsString()
  @IsOptional()
  shortDescription: string | undefined;

  @ApiProperty({
    description: 'Description of the spell list',
    required: false,
    example: 'A detailed description of the spell list with all its features and spells',
  })
  @IsString()
  @IsOptional()
  description: string | undefined;

  @ApiProperty({
    description: 'Image URL of the spell list',
    required: false,
    example: 'https://example.com/images/spell-lists/some-spell-list.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl: string | undefined;

  static toCommand(dto: CreateSpellListDto, userId: string, userRoles: string[]) {
    return new CreateSpellListCommand(dto.name, dto.shortDescription, dto.description, dto.imageUrl, userId, userRoles);
  }
}

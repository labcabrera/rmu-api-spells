import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { CreateSpellCommand } from 'src/modules/spells/application/cqrs/commands/create-spell.command';
import { NamedEntityDto } from 'src/modules/shared/interfaces/http/dto/named-entity.dto';

export class CreateSpellDto {
  @ApiProperty({ description: 'Name of the spell', example: 'Some name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Short description of the spell', required: false, example: 'A brief overview of the spell' })
  @IsOptional()
  spellList: NamedEntityDto | undefined;

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

  static toCommand(dto: CreateSpellDto, userId: string, userRoles: string[]) {
    return new CreateSpellCommand(dto.name, NamedEntityDto.toEntity(dto.spellList), dto.description, dto.imageUrl, userId, userRoles);
  }
}

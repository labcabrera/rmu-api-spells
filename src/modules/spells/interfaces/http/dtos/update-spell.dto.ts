import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { UpdateSpellCommand } from 'src/modules/spells/application/cqrs/commands/update-spell.command';
import { NamedEntityDto } from 'src/modules/shared/interfaces/http/dto/named-entity.dto';

export class UpdateSpellDto {
  @ApiProperty({ description: 'Name of the spell', example: 'Fireball' })
  @IsString()
  @IsOptional()
  name: string | undefined;

  @ApiProperty({ description: 'Short description of the spell', required: false, example: 'A powerful fire spell' })
  @IsOptional()
  spellList: NamedEntityDto | undefined;

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
    return new UpdateSpellCommand(id, dto.name, NamedEntityDto.toEntity(dto.spellList), dto.description, dto.imageUrl, userId, userRoles);
  }
}

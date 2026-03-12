import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from 'src/modules/shared/interfaces/http/dto/page.dto';
import { Spell } from 'src/modules/spells/domain/aggregates/spell';
import { NamedEntityDto } from 'src/modules/shared/interfaces/http/dto/named-entity.dto';

export class SpellDto {
  @ApiProperty({ description: 'Unique identifier for the spell', example: 'fireball' })
  id: string;

  @ApiProperty({ description: 'Name of the spell', example: 'Fireball' })
  name: string;

  @ApiProperty({ description: 'Spell list reference', required: false, type: NamedEntityDto })
  spellList?: NamedEntityDto;

  @ApiProperty({
    description: 'Description of the spell',
    required: false,
    example: 'A detailed description of the spell with all its features and effects',
  })
  description?: string;

  @ApiProperty({
    description: 'Image URL of the spell',
    required: false,
    example: 'https://example.com/images/spells/fireball.jpg',
  })
  imageUrl?: string;

  static fromEntity(entity: Spell): SpellDto {
    const dto = new SpellDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.spellList = entity.spellList ? NamedEntityDto.fromEntity(entity.spellList) : undefined;
    dto.description = entity.description;
    dto.imageUrl = entity.imageUrl;
    return dto;
  }
}

export class SpellPageDto {
  @ApiProperty({
    type: [SpellDto],
    description: 'Spells',
    isArray: true,
  })
  content: SpellDto[];
  @ApiProperty({
    type: PaginationDto,
    description: 'Pagination information',
  })
  pagination: PaginationDto;
}

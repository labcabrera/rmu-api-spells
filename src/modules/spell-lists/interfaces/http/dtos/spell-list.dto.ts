import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from 'src/modules/shared/interfaces/http/dto/page.dto';
import { SpellList } from 'src/modules/spell-lists/domain/aggregates/spell-list';

export class SpellListDto {
  @ApiProperty({ description: 'Unique identifier for the spell list', example: 'fireball' })
  id: string;

  @ApiProperty({ description: 'Name of the spell list', example: 'Fireball' })
  name: string;

  @ApiProperty({ description: 'Short description of the spell list', required: false, example: 'A powerful fire spell' })
  shortDescription?: string;

  @ApiProperty({
    description: 'Description of the spell list',
    required: false,
    example: 'A detailed description of the spell list with all its features and spells',
  })
  description?: string;

  @ApiProperty({
    description: 'Image URL of the spell list',
    required: false,
    example: 'https://example.com/images/spell-lists/fireball.jpg',
  })
  imageUrl?: string;

  static fromEntity(entity: SpellList): SpellListDto {
    const dto = new SpellListDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.shortDescription = entity.shortDescription;
    dto.description = entity.description;
    dto.imageUrl = entity.imageUrl;
    return dto;
  }
}

export class SpellListPageDto {
  @ApiProperty({
    type: [SpellListDto],
    description: 'Spell lists',
    isArray: true,
  })
  content: SpellListDto[];
  @ApiProperty({
    type: PaginationDto,
    description: 'Pagination information',
  })
  pagination: PaginationDto;
}

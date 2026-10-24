import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../../shared/interfaces/http/dto/page.dto.js';
import { SpellList } from '../../../domain/aggregates/spell-list.js';
import type { ListType } from '../../../domain/value-objects/list-type.vo.js';
import type { RealmType } from '../../../domain/value-objects/realm-type.vo.js';

export class SpellListDto {
  @ApiProperty({ description: 'Unique identifier for the spell list', example: 'fireball' })
  id: string;

  @ApiProperty({ type: String, description: 'Realm of the spell list', example: 'channeling' })
  realm: RealmType;

  @ApiProperty({ type: String, description: 'Type of the spell list', example: 'channeling' })
  type: ListType;

  @ApiProperty({ type: String, description: 'Profession id associated with the list', required: false, example: 'prof-123' })
  professionId?: string | null;

  @ApiProperty({ description: 'Access type of the spell list, which its spells take', example: 'public', enum: ['public', 'private'] })
  accessType: string;

  @ApiProperty({ description: 'Id of the user that created the list: only this user (or an admin) changes it and its spells' })
  owner: string;

  @ApiProperty({ type: Date, description: 'Creation time', example: '2026-10-24T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ type: Date, nullable: true, description: 'Time of the last change; null if it never changed', example: null })
  updatedAt: Date | null;

  @ApiProperty({ description: 'Name of the spell list', example: 'Fireball' })
  name: string;

  @ApiProperty({
    type: String,
    description: 'Description of the spell list',
    required: false,
    example: 'A detailed description of the spell list with all its features and spells',
  })
  description: string | null;

  @ApiProperty({
    type: String,
    description: 'Image URL of the spell list',
    required: false,
    example: 'https://example.com/images/spell-lists/fireball.jpg',
  })
  imageUrl: string | null;

  @ApiProperty({ description: 'Version of optimistic concurrency: send it back in the PATCH to detect a concurrent change', example: 0 })
  version: number;

  static fromEntity(entity: SpellList): SpellListDto {
    const dto = new SpellListDto();
    dto.id = entity.id;
    dto.version = entity.version;
    dto.realm = entity.realm;
    dto.type = entity.type;
    dto.professionId = entity.professionId ?? null;
    dto.accessType = entity.accessType;
    dto.owner = entity.owner;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.imageUrl = entity.imageUrl;
    return dto;
  }
}

export class SpellListPageDto {
  @ApiProperty({ type: [SpellListDto], description: 'Spell lists' })
  content: SpellListDto[];
  @ApiProperty({
    type: PaginationDto,
    description: 'Pagination information',
  })
  pagination: PaginationDto;
}

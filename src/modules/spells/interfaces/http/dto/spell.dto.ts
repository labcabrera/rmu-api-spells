import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../../shared/interfaces/http/dto/page.dto.js';
import { Spell } from '../../../domain/aggregates/spell.js';
import SpellModifiersDto from './spell-modifiers.dto.js';
import type { SpellEffect } from '../../../domain/value-objects/spell-effect.vo.js';

export class SpellDto {
  @ApiProperty({ description: 'Unique identifier for the spell', example: 'fireball' })
  id: string;

  @ApiProperty({ type: String, description: 'Id of the spell list: the spell takes its permissions and visibility' })
  spellListId: string;

  @ApiProperty({ description: 'Name of the spell', example: 'Fireball' })
  name: string;

  @ApiProperty({ description: 'Level of the spell', example: 1 })
  level: number;

  @ApiProperty({ description: 'Modifiers for the spell', required: true, type: () => SpellModifiersDto })
  modifiers: SpellModifiersDto;

  @ApiProperty({ type: String, nullable: true, description: 'Id of the spell it is a variant of ("as X, but…")' })
  basedOn: string | null;

  @ApiProperty({ type: 'array', items: { type: 'object' }, description: 'What the spell does to its targets (spec 028)' })
  effects: SpellEffect[];

  @ApiProperty({
    description: 'Access type of the spell. Who reads the spell depends on its list; this one only counts if the list no longer exists',
    example: 'public',
    enum: ['public', 'private'],
  })
  accessType: string;

  @ApiProperty({ description: 'Id of the user that created the spell', example: 'b3a1c2d4-0000-4000-8000-000000000000' })
  owner: string;

  @ApiProperty({ type: Date, description: 'Creation time', example: '2026-10-24T10:00:00.000Z' })
  createdAt: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'Time of the last change; missing if it never changed',
    example: '2026-10-24T11:00:00.000Z',
  })
  updatedAt?: Date;

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

  @ApiProperty({ description: 'Version of optimistic concurrency: send it back in the PATCH to detect a concurrent change', example: 0 })
  version: number;

  static fromEntity(entity: Spell): SpellDto {
    const dto = new SpellDto();
    dto.id = entity.id;
    dto.version = entity.version;
    dto.name = entity.name;
    dto.level = entity.level;
    dto.spellListId = entity.spellListId;
    dto.description = entity.description;
    dto.imageUrl = entity.imageUrl;
    dto.accessType = entity.accessType;
    dto.owner = entity.owner;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.modifiers = SpellModifiersDto.fromEntity(entity.modifiers);
    dto.basedOn = entity.basedOn;
    dto.effects = entity.effects;
    return dto;
  }
}

export class SpellPageDto {
  @ApiProperty({ type: [SpellDto], description: 'Spells' })
  content: SpellDto[];
  @ApiProperty({
    type: PaginationDto,
    description: 'Pagination information',
  })
  pagination: PaginationDto;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { UpdateSpellListCommand } from '../../../application/cqrs/commands/update-spell-list.command.js';
import { LIST_TYPES, type ListType } from '../../../domain/value-objects/list-type.vo.js';
import { REALM_TYPES, type RealmType } from '../../../domain/value-objects/realm-type.vo.js';
import type { AccessType } from '../../../../shared/domain/entities/access-type.js';

export class UpdateSpellListDto {
  @ApiPropertyOptional({ type: String, description: 'Name of the spell list', example: 'Fireball' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string | undefined;

  @ApiPropertyOptional({
    type: [String],
    enum: REALM_TYPES,
    description: 'Realms of the list: one, or two for a hybrid profession (spec 028)',
    example: ['channeling'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @ArrayUnique()
  @IsIn(REALM_TYPES, { each: true })
  @IsOptional()
  realms: RealmType[] | undefined;

  @ApiPropertyOptional({ type: String, enum: REALM_TYPES, description: 'Deprecated (spec 028): use `realms`', deprecated: true })
  @IsIn(REALM_TYPES)
  @IsOptional()
  realm: RealmType | undefined;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Code of a book list: an empty string or null clears it' })
  @IsString()
  @IsOptional()
  code: string | null | undefined;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Spell Law section: an empty string or null clears it' })
  @IsString()
  @IsOptional()
  bookSection: string | null | undefined;

  @ApiPropertyOptional({ type: String, enum: LIST_TYPES, description: 'Type of the spell list', example: 'open' })
  @IsIn(LIST_TYPES)
  @IsOptional()
  type: ListType | undefined;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Profession id of a base list: an empty string or null clears it',
    example: 'prof-123',
  })
  @IsString()
  @IsOptional()
  professionId: string | null | undefined;

  @ApiProperty({
    type: String,
    description: 'Access type of the spell list',
    required: false,
    example: 'public',
    enum: ['public', 'private'],
  })
  @IsString()
  @IsIn(['public', 'private'])
  @IsOptional()
  accessType: AccessType | undefined;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Description of the spell list: an empty string or null clears it',
    example: 'A detailed description of the fireball spell list',
  })
  @IsString()
  @IsOptional()
  description: string | null | undefined;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Image URL of the spell list: an empty string or null clears it',
    example: 'https://example.com/images/spell-lists/fireball.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl: string | null | undefined;

  @ApiPropertyOptional({ description: 'Version the client read (from the GET); a different stored version is a 409', example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  version?: number;

  static toCommand(id: string, dto: UpdateSpellListDto, userId: string, userRoles: string[]) {
    return new UpdateSpellListCommand(
      id,
      dto.name,
      dto.realms ?? (dto.realm ? [dto.realm] : undefined),
      dto.type,
      dto.code,
      dto.bookSection,
      dto.professionId,
      dto.accessType,
      dto.description,
      dto.imageUrl,
      userId,
      userRoles,
      dto.version,
    );
  }
}

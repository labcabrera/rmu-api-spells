import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsIn, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { CreateSpellListCommand } from '../../../application/cqrs/commands/create-spell-list.command.js';
import { LIST_TYPES, type ListType } from '../../../domain/value-objects/list-type.vo.js';
import { REALM_TYPES, type RealmType } from '../../../domain/value-objects/realm-type.vo.js';
import type { AccessType } from '../../../../shared/domain/entities/access-type.js';

export class CreateSpellListDto {
  @ApiProperty({ description: 'Name of the spell list', example: 'Some name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: [String],
    enum: REALM_TYPES,
    description: 'Realms of the list: one, or two for the base lists of a hybrid profession (spec 028)',
    example: ['channeling'],
    required: false,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @ArrayUnique()
  @IsIn(REALM_TYPES, { each: true })
  @ValidateIf((dto: CreateSpellListDto) => dto.realm === undefined || dto.realms !== undefined)
  realms: RealmType[] | undefined;

  @ApiProperty({ type: String, enum: REALM_TYPES, description: 'Deprecated (spec 028): use `realms`', required: false, deprecated: true })
  @IsIn(REALM_TYPES)
  @IsOptional()
  realm: RealmType | undefined;

  @ApiProperty({ type: String, enum: LIST_TYPES, description: 'Type of the spell list', example: 'open' })
  @IsIn(LIST_TYPES)
  type: ListType;

  @ApiProperty({ type: String, description: 'Stable code of a book list (slug of its name)', required: false, example: 'fire-law' })
  @IsString()
  @IsOptional()
  code: string | null;

  @ApiProperty({ type: String, description: 'Spell Law section of a book list', required: false, example: '7.2' })
  @IsString()
  @IsOptional()
  bookSection: string | null;

  @ApiProperty({ type: String, description: 'Profession id associated with the list', required: false, example: 'prof-123' })
  @IsString()
  @IsOptional()
  professionId: string | null;

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

  @ApiProperty({
    type: String,
    description: 'Description of the spell list',
    required: false,
    example: 'A detailed description of the spell list with all its features and spells',
  })
  @IsString()
  @IsOptional()
  description: string | null;

  @ApiProperty({
    type: String,
    description: 'Image URL of the spell list',
    required: false,
    example: 'https://example.com/images/spell-lists/some-spell-list.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl: string | null;

  static toCommand(dto: CreateSpellListDto, userId: string, userRoles: string[]) {
    return new CreateSpellListCommand(
      dto.name,
      dto.realms ?? (dto.realm ? [dto.realm] : []),
      dto.type,
      dto.code ?? null,
      dto.bookSection ?? null,
      dto.professionId,
      dto.accessType ?? 'public',
      dto.description,
      dto.imageUrl,
      userId,
      userRoles,
    );
  }
}

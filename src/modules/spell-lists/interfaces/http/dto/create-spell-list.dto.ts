import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { CreateSpellListCommand } from '../../../application/cqrs/commands/create-spell-list.command.js';
import type { ListType } from '../../../domain/value-objects/list-type.vo.js';
import type { RealmType } from '../../../domain/value-objects/realm-type.vo.js';
import type { AccessType } from '../../../../shared/domain/entities/access-type.js';

export class CreateSpellListDto {
  @ApiProperty({ description: 'Name of the spell list', example: 'Some name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: String, description: 'Realm of the spell list', example: 'channeling', required: true })
  @IsString()
  realm: RealmType;

  @ApiProperty({ type: String, description: 'Type of the spell list', example: 'open', required: true })
  @IsString()
  type: ListType;

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
      dto.realm,
      dto.type,
      dto.professionId,
      dto.accessType ?? 'public',
      dto.description,
      dto.imageUrl,
      userId,
      userRoles,
    );
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { UpdateSpellListCommand } from '../../../application/cqrs/commands/update-spell-list.command.js';
import type { ListType } from '../../../domain/value-objects/list-type.vo.js';
import type { RealmType } from '../../../domain/value-objects/realm-type.vo.js';
import type { AccessType } from '../../../../shared/domain/entities/access-type.js';

export class UpdateSpellListDto {
  @ApiProperty({ type: String, description: 'Name of the spell list', example: 'Fireball' })
  @IsString()
  @IsOptional()
  name: string | undefined;

  @ApiProperty({ type: String, description: 'Realm of the spell list', required: false, example: 'channeling' })
  @IsOptional()
  realm: RealmType | undefined;

  @ApiProperty({ type: String, description: 'Type of the spell list', required: false, example: 'open' })
  @IsOptional()
  type: ListType | undefined;

  @ApiProperty({ type: String, description: 'Profession id associated with the list', required: false, example: 'prof-123' })
  @IsOptional()
  professionId: string | undefined;

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
    example: 'A detailed description of the fireball spell list',
  })
  @IsString()
  @IsOptional()
  description: string | undefined;

  @ApiProperty({
    type: String,
    description: 'Image URL of the spell list',
    required: false,
    example: 'https://example.com/images/spell-lists/fireball.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl: string | undefined;

  static toCommand(id: string, dto: UpdateSpellListDto, userId: string, userRoles: string[]) {
    return new UpdateSpellListCommand(
      id,
      dto.name,
      dto.realm,
      dto.type,
      dto.professionId,
      dto.accessType,
      dto.description,
      dto.imageUrl,
      userId,
      userRoles,
    );
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { CreateSpellListCommand } from 'src/modules/spell-lists/application/cqrs/commands/create-spell-list.command';
import type { ListType } from 'src/modules/spell-lists/domain/value-objects/list-type.vo';
import type { RealmType } from 'src/modules/spell-lists/domain/value-objects/realm-type.vo';
import { AccessType } from 'src/modules/shared/domain/entities/access-type';

export class CreateSpellListDto {
  @ApiProperty({ description: 'Name of the spell list', example: 'Some name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Realm of the spell list', example: 'channeling', required: true })
  @IsString()
  realm: RealmType;

  @ApiProperty({ description: 'Type of the spell list', example: 'open', required: true })
  @IsString()
  type: ListType;

  @ApiProperty({ description: 'Profession id associated with the list', required: false, example: 'prof-123' })
  @IsString()
  @IsOptional()
  professionId: string | null;

  @ApiProperty({ description: 'Access type of the spell list', required: false, example: 'public', enum: ['public', 'private'] })
  @IsString()
  @IsIn(['public', 'private'])
  @IsOptional()
  accessType: AccessType | undefined;

  @ApiProperty({
    description: 'Description of the spell list',
    required: false,
    example: 'A detailed description of the spell list with all its features and spells',
  })
  @IsString()
  @IsOptional()
  description: string | null;

  @ApiProperty({
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

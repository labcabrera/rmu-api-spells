import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { CreateSpellListCommand } from 'src/modules/spell-lists/application/cqrs/commands/create-spell-list.command';
import type { ListType } from 'src/modules/spell-lists/domain/value-objects/list-type.vo';
import type { RealmType } from 'src/modules/spell-lists/domain/value-objects/realm-type.vo';

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

  @ApiProperty({
    description: 'Description of the spell list',
    required: false,
    example: 'A detailed description of the spell list with all its features and spells',
  })
  @IsString()
  @IsOptional()
  description: string | undefined;

  @ApiProperty({
    description: 'Image URL of the spell list',
    required: false,
    example: 'https://example.com/images/spell-lists/some-spell-list.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl: string | undefined;

  static toCommand(dto: CreateSpellListDto, userId: string, userRoles: string[]) {
    return new CreateSpellListCommand(dto.name, dto.realm, dto.type, dto.description, dto.imageUrl, userId, userRoles);
  }
}

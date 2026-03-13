import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { UpdateSpellListCommand } from 'src/modules/spell-lists/application/cqrs/commands/update-spell-list.command';
import { ListType } from 'src/modules/spell-lists/domain/value-objects/list-type.vo';
import type { RealmType } from 'src/modules/spell-lists/domain/value-objects/realm-type.vo';

export class UpdateSpellListDto {
  @ApiProperty({ description: 'Name of the spell list', example: 'Fireball' })
  @IsString()
  @IsOptional()
  name: string | undefined;

  @ApiProperty({ description: 'Realm of the spell list', required: false, example: 'channeling' })
  @IsOptional()
  realm: RealmType | undefined;

  @ApiProperty({ description: 'Type of the spell list', required: false, example: 'open' })
  @IsOptional()
  type: ListType | undefined;

  @ApiProperty({ description: 'Profession id associated with the list', required: false, example: 'prof-123' })
  @IsOptional()
  professionId: string | undefined;

  @ApiProperty({
    description: 'Description of the spell list',
    required: false,
    example: 'A detailed description of the fireball spell list',
  })
  @IsString()
  @IsOptional()
  description: string | undefined;

  @ApiProperty({
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
      dto.description,
      dto.imageUrl,
      userId,
      userRoles,
    );
  }
}

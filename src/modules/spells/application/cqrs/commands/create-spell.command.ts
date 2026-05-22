import { SpellModifiers } from 'src/modules/spells/domain/value-objects/spell-modifiers.vo';
import { AccessType } from 'src/modules/shared/domain/entities/access-type';

export class CreateSpellCommand {
  constructor(
    public readonly spellListId: string,
    public readonly name: string,
    public readonly level: number,
    public readonly modifiers: SpellModifiers,
    public readonly accessType: AccessType,
    public readonly description: string | undefined,
    public readonly imageUrl: string | undefined,
    public readonly user: string,
    public readonly roles: string[],
  ) {}
}

import { SpellModifiers } from 'src/modules/spells/domain/value-objects/spell-modifiers.vo';

export class UpdateSpellCommand {
  constructor(
    public readonly id: string,
    public readonly name: string | undefined,
    public readonly level: number | undefined,
    public readonly modifiers: SpellModifiers | undefined,
    public readonly description: string | undefined,
    public readonly imageUrl: string | undefined,
    public readonly user: string,
    public readonly roles: string[],
  ) {}
}

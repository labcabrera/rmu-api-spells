import { AuthenticatedCommand } from 'src/modules/shared/application/cqrs/authenticated-command';

export class DeleteSpellCommand extends AuthenticatedCommand {
  constructor(
    public readonly spellId: string,
    userId: string,
    roles: string[],
  ) {
    super(userId, roles);
  }
}

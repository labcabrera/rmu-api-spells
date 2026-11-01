import { SpellListGuardAdapter } from '../../../src/modules/spell-lists/infrastructure/security/spell-list.guard.adapter.js';
import { SpellList } from '../../../src/modules/spell-lists/domain/aggregates/spell-list.js';
import { ForbiddenError } from '../../../src/modules/shared/domain/errors/errors.js';
import { SYSTEM_ENTITY_ADMIN_ONLY } from '../../../src/modules/shared/domain/services/entity-permissions.js';
import type { EntitySource } from '../../../src/modules/shared/domain/entities/entity-source.js';

const newList = (entitySource: EntitySource, owner = 'owner-1') =>
  SpellList.create({
    name: 'Fire Law',
    realms: ['essence'],
    code: null,
    bookSection: null,
    type: 'open',
    professionId: null,
    accessType: 'public',
    entitySource,
    description: null,
    imageUrl: null,
    owner,
  });

const codeOf = (fn: () => void) => {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(ForbiddenError);
    return (error as ForbiddenError).code;
  }
  return undefined;
};

// Spec 063: BaseEntityGuard checks the source on update and delete, and checkEntitySource on create and patch.
describe('SpellListGuardAdapter', () => {
  const guard = new SpellListGuardAdapter();

  it('lets only an admin update or delete a system list, even its owner gets system-entity-admin-only', () => {
    const list = newList('system');
    expect(codeOf(() => guard.checkUpdate(list, 'owner-1', ['rmu-user']))).toBe(SYSTEM_ENTITY_ADMIN_ONLY);
    expect(codeOf(() => guard.checkDelete(list, 'owner-1', ['rmu-user']))).toBe(SYSTEM_ENTITY_ADMIN_ONLY);
    expect(codeOf(() => guard.checkUpdate(list, 'admin-1', ['rmu-admin']))).toBeUndefined();
    expect(codeOf(() => guard.checkDelete(list, 'admin-1', ['rmu-admin']))).toBeUndefined();
  });

  it('lets the owner and an admin change a user list, and nobody else', () => {
    const list = newList('user');
    expect(codeOf(() => guard.checkUpdate(list, 'owner-1', ['rmu-user']))).toBeUndefined();
    expect(codeOf(() => guard.checkDelete(list, 'admin-1', ['rmu-admin']))).toBeUndefined();
    expect(codeOf(() => guard.checkUpdate(list, 'other-1', ['rmu-user']))).toBe('forbidden');
    expect(codeOf(() => guard.checkDelete(list, 'other-1', ['rmu-user']))).toBe('forbidden');
  });

  it('lets only an admin ask for the system source', () => {
    expect(codeOf(() => guard.checkEntitySource(['rmu-user'], 'system'))).toBe(SYSTEM_ENTITY_ADMIN_ONLY);
    expect(codeOf(() => guard.checkEntitySource(['rmu-user'], 'user'))).toBeUndefined();
    expect(codeOf(() => guard.checkEntitySource(['rmu-user'], undefined))).toBeUndefined();
    expect(codeOf(() => guard.checkEntitySource(['rmu-admin'], 'system'))).toBeUndefined();
  });

  it('keeps the read rule: a public system list is readable by everyone', () => {
    expect(codeOf(() => guard.checkRead(newList('system'), 'other-1', ['rmu-user']))).toBeUndefined();
  });

  it('reads a list without a source as user', () => {
    const props = { ...newList('user').getProps(), entitySource: undefined as unknown as EntitySource };
    expect(SpellList.fromProps(props).entitySource).toBe('user');
  });
});

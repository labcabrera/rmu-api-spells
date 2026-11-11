import { SpellGuardAdapter } from '../../../src/modules/spells/infrastructure/security/spell.guard.adapter.js';
import { SpellListGuardAdapter } from '../../../src/modules/spell-lists/infrastructure/security/spell-list.guard.adapter.js';
import { Spell } from '../../../src/modules/spells/domain/aggregates/spell.js';
import { SpellModifiers } from '../../../src/modules/spells/domain/value-objects/spell-modifiers.vo.js';
import { ForbiddenError } from '../../../src/modules/shared/domain/errors/errors.js';
import { SYSTEM_ENTITY_ADMIN_ONLY } from '../../../src/modules/shared/domain/services/entity-permissions.js';
import type { EntitySource } from '../../../src/modules/shared/domain/entities/entity-source.js';
import { SpellList } from '../../../src/modules/spell-lists/domain/aggregates/spell-list.js';

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

const newSpell = (entitySource: EntitySource, owner = 'owner-1') =>
  Spell.create({
    spellListId: 'list-1',
    name: 'Fire Bolt',
    level: 3,
    modifiers: SpellModifiers.empty(),
    basedOn: null,
    effects: [],
    alchemy: null,
    accessType: 'public',
    entitySource,
    description: undefined,
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

const USER = ['rmu-user'];
const ADMIN = ['rmu-admin'];

// Spec 063: a spell of a list follows the list; a spell without a list, its own source and owner.
describe('SpellGuardAdapter', () => {
  const guard = new SpellGuardAdapter(new SpellListGuardAdapter());

  it('lets only an admin add spells to a system list, even its owner', () => {
    const list = newList('system');
    expect(codeOf(() => guard.checkCreate(list, 'owner-1', USER))).toBe(SYSTEM_ENTITY_ADMIN_ONLY);
    expect(codeOf(() => guard.checkCreate(list, 'admin-1', ADMIN))).toBeUndefined();
  });

  it('lets the owner of a user list add spells, and not another user', () => {
    const list = newList('user');
    expect(codeOf(() => guard.checkCreate(list, 'owner-1', USER))).toBeUndefined();
    expect(codeOf(() => guard.checkCreate(list, 'other-1', USER))).toBe('forbidden');
    expect(codeOf(() => guard.checkCreate(list, 'owner-1', []))).toBe('forbidden');
  });

  it('decides a spell of a list by the list: its source and its owner', () => {
    // The spell says user and belongs to the user, but the list is a system one.
    const spell = newSpell('user', 'other-1');
    expect(codeOf(() => guard.checkUpdate(spell, newList('system'), 'other-1', USER))).toBe(SYSTEM_ENTITY_ADMIN_ONLY);
    expect(codeOf(() => guard.checkDelete(spell, newList('system'), 'owner-1', USER))).toBe(SYSTEM_ENTITY_ADMIN_ONLY);
    expect(codeOf(() => guard.checkUpdate(spell, newList('system'), 'admin-1', ADMIN))).toBeUndefined();
    expect(codeOf(() => guard.checkUpdate(spell, newList('user'), 'owner-1', USER))).toBeUndefined();
    expect(codeOf(() => guard.checkDelete(spell, newList('user'), 'other-1', USER))).toBe('forbidden');
  });

  it('decides a spell without a list by its own source and owner', () => {
    expect(codeOf(() => guard.checkUpdate(newSpell('system'), null, 'owner-1', USER))).toBe(SYSTEM_ENTITY_ADMIN_ONLY);
    expect(codeOf(() => guard.checkDelete(newSpell('system'), null, 'admin-1', ADMIN))).toBeUndefined();
    expect(codeOf(() => guard.checkUpdate(newSpell('user'), null, 'owner-1', USER))).toBeUndefined();
    expect(codeOf(() => guard.checkDelete(newSpell('user'), null, 'other-1', USER))).toBe('forbidden');
  });

  it('lets only an admin ask for the system source of a spell without a list', () => {
    expect(codeOf(() => guard.checkEntitySource(USER, 'system'))).toBe(SYSTEM_ENTITY_ADMIN_ONLY);
    expect(codeOf(() => guard.checkEntitySource(USER, 'user'))).toBeUndefined();
    expect(codeOf(() => guard.checkEntitySource(ADMIN, 'system'))).toBeUndefined();
  });
});

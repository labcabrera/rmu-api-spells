import {
  assertCanChangeEntity,
  canChangeEntity,
  checkEntitySource,
  SYSTEM_ENTITY_ADMIN_ONLY,
} from '../../../../src/modules/shared/domain/services/entity-permissions.js';
import { ForbiddenError } from '../../../../src/modules/shared/domain/errors/errors.js';
import type { EntitySource } from '../../../../src/modules/shared/domain/entities/entity-source.js';

const OWNER = 'owner-1';
const ADMIN = ['rmu-admin'];
const USER = ['rmu-user'];

const entity = (entitySource: EntitySource | null | undefined) => ({ owner: OWNER, entitySource });

const codeOf = (fn: () => void): string | undefined => {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(ForbiddenError);
    return (error as ForbiddenError).code;
  }
  return undefined;
};

// Spec 063: system entities are admin only; user entities, their owner or an admin.
describe('entity permissions', () => {
  describe.each([
    // who, userId, roles, source, can change, error code
    ['admin', 'admin-1', ADMIN, 'system', true, undefined],
    ['admin', 'admin-1', ADMIN, 'user', true, undefined],
    ['owner', OWNER, USER, 'system', false, SYSTEM_ENTITY_ADMIN_ONLY],
    ['owner', OWNER, USER, 'user', true, undefined],
    ['other', 'other-1', USER, 'system', false, SYSTEM_ENTITY_ADMIN_ONLY],
    ['other', 'other-1', USER, 'user', false, 'forbidden'],
    ['owner', OWNER, USER, undefined, true, undefined],
    ['owner', OWNER, USER, null, true, undefined],
    ['other', 'other-1', USER, undefined, false, 'forbidden'],
  ] as const)('%s on a %s entity', (_who, userId, roles, source, allowed, code) => {
    it(`canChangeEntity is ${allowed}`, () => {
      expect(canChangeEntity(entity(source), userId, [...roles])).toBe(allowed);
    });

    it.each(['update', 'delete'] as const)(`assertCanChangeEntity(%s) ${allowed ? 'passes' : `throws ${code}`}`, action => {
      expect(codeOf(() => assertCanChangeEntity(entity(source), userId, [...roles], action))).toBe(code);
    });
  });

  it('does not let anyone but an admin change an entity without an owner', () => {
    expect(canChangeEntity({ owner: null, entitySource: 'user' }, '', USER)).toBe(false);
    expect(canChangeEntity({ entitySource: 'user' }, 'admin-1', ADMIN)).toBe(true);
  });

  describe('checkEntitySource', () => {
    it('lets an admin ask for any source', () => {
      expect(() => checkEntitySource('system', ADMIN)).not.toThrow();
      expect(() => checkEntitySource('user', ADMIN)).not.toThrow();
      expect(() => checkEntitySource(undefined, ADMIN)).not.toThrow();
    });

    it('rejects system for a non-admin, and lets undefined and user pass', () => {
      expect(codeOf(() => checkEntitySource('system', USER))).toBe(SYSTEM_ENTITY_ADMIN_ONLY);
      expect(codeOf(() => checkEntitySource('system', []))).toBe(SYSTEM_ENTITY_ADMIN_ONLY);
      expect(() => checkEntitySource('user', USER)).not.toThrow();
      expect(() => checkEntitySource(undefined, USER)).not.toThrow();
    });
  });
});

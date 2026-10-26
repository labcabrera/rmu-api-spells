import { SpellList } from '../../../../src/modules/spell-lists/domain/aggregates/spell-list.js';
import { DomainEvent } from '../../../../src/modules/shared/domain/events/domain-event.js';

const newList = () =>
  SpellList.create({
    name: 'Fire Law',
    realms: ['essence'],
    code: null,
    bookSection: null,
    type: 'open',
    professionId: null,
    accessType: 'public',
    description: 'Text',
    imageUrl: null,
    owner: 'user-1',
  });

// Spec 021, decision 9: one change detection in the base aggregate (F-receta-23) and a version that is not serialized
// (F-receta-27).
describe('BaseAggregateRoot', () => {
  it('has changes until it is stored, and then only when its state moves', () => {
    const list = newList();
    expect(list.hasChanges()).toBe(true);
    list.restoreVersion(0);
    expect(list.hasChanges()).toBe(false);

    list.update({ name: 'Fire Law' });
    expect(list.hasChanges()).toBe(false);
    expect(list.getUncommittedEvents()).toHaveLength(1);

    list.update({ name: 'Fire Mastery' });
    expect(list.hasChanges()).toBe(true);
    expect(list.updatedAt).toBeInstanceOf(Date);
    expect(list.getUncommittedEvents()).toHaveLength(2);

    list.restoreVersion(1);
    expect(list.hasChanges()).toBe(false);
    expect(list.version).toBe(1);
  });

  it('does not count updatedAt as a change', () => {
    const list = newList().restoreVersion(0);
    list.updatedAt = new Date();
    expect(list.hasChanges()).toBe(false);
  });

  it('keeps the version out of the JSON of the aggregate', () => {
    const list = newList().restoreVersion(7);
    expect(JSON.stringify(list)).not.toContain('storedVersion');
    expect(JSON.parse(JSON.stringify(list))).not.toHaveProperty('version');
  });

  it('rejects a stale version with a conflict', () => {
    const list = newList().restoreVersion(2);
    expect(() => list.checkVersion(1)).toThrow(expect.objectContaining({ statusCode: 409, code: 'version-conflict' }));
    expect(() => list.checkVersion(2)).not.toThrow();
    expect(() => list.checkVersion(undefined)).not.toThrow();
  });
});

describe('DomainEvent', () => {
  const previous = process.env.RMU_KAFKA_CLIENT_ID;
  afterEach(() => {
    if (previous === undefined) delete process.env.RMU_KAFKA_CLIENT_ID;
    else process.env.RMU_KAFKA_CLIENT_ID = previous;
  });

  it('names the API as its producer (F-spells-09)', () => {
    process.env.RMU_KAFKA_CLIENT_ID = 'rmu-api-spells-test';
    expect(new DomainEvent('created', {}).producer).toBe('rmu-api-spells-test');
    delete process.env.RMU_KAFKA_CLIENT_ID;
    expect(new DomainEvent('created', {}).producer).toBe('rmu-api-spells');
  });
});

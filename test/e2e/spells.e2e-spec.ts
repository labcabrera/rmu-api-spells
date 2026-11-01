import request from 'supertest';
import { type E2eApp, ids, startApp, takeTopics, type UserName } from './support/app.js';
import { spellBody, spellListBody, spellModifiers, stunEffect } from './support/fixtures.js';
import { SPELL_TARGET_TYPES } from '../../src/modules/spells/domain/value-objects/spell-area.vo.js';

type SpellBody = {
  id: string;
  createdAt?: string;
  spellListId?: string;
  name: string;
  level: number;
  accessType: string;
  description?: string;
  modifiers: Record<string, unknown>;
  basedOn: string | null;
  effects: Record<string, unknown>[];
  alchemy?: Record<string, unknown> | null;
};

describe('Spells (e2e)', () => {
  let e2e: E2eApp;
  let listId: string;

  beforeAll(async () => {
    e2e = await startApp();
    const list = await request(e2e.server)
      .post('/v1/spell-lists')
      .set('Authorization', e2e.auth('owner'))
      .send(spellListBody({ name: 'Spells of the suite' }))
      .expect(201);
    listId = (list.body as { id: string }).id;
  });

  afterAll(async () => {
    await e2e?.stop();
  });

  const create = async (user: UserName, overrides: Record<string, unknown> = {}) => {
    const res = await request(e2e.server)
      .post('/v1/spells')
      .set('Authorization', e2e.auth(user))
      .send(spellBody(listId, overrides))
      .expect(201);
    return res.body as SpellBody;
  };

  it('rejects a request without a token', async () => {
    await request(e2e.server).get('/v1/spells').expect(401);
  });

  describe('CRUD', () => {
    it('creates, reads, lists, updates and deletes a spell, publishing its events', async () => {
      const auth = e2e.auth('owner');
      takeTopics(e2e.events);

      const created = await create('owner', { name: 'Fire Bolt', level: 5 });
      // F-spells-26: the response says who owns the spell and when it changed.
      expect(created).toMatchObject({ owner: 'e2e-owner', createdAt: expect.any(String) as unknown });
      expect(created).not.toHaveProperty('updatedAt');
      expect(created).toMatchObject({
        name: 'Fire Bolt',
        level: 5,
        spellListId: listId,
        accessType: 'private',
        description: 'A spell of the suite',
        modifiers: spellModifiers(),
        basedOn: null,
        effects: [],
      });

      const found = await request(e2e.server).get(`/v1/spells/${created.id}`).set('Authorization', auth).expect(200);
      expect(found.body).toEqual(created);

      const listed = await request(e2e.server).get('/v1/spells?q=name=="Fire Bolt"').set('Authorization', auth).expect(200);
      expect(ids(listed.body)).toEqual([created.id]);
      expect(listed.body).toMatchObject({ pagination: { page: 0, size: 10, totalElements: 1 } });

      const updated = await request(e2e.server)
        .patch(`/v1/spells/${created.id}`)
        .set('Authorization', auth)
        .send({ name: 'Fire Lance', level: 7, accessType: 'public', description: 'Changed' })
        .expect(200);
      expect(updated.body).toMatchObject({ name: 'Fire Lance', level: 7, accessType: 'public', description: 'Changed' });
      expect(updated.body).toMatchObject({ owner: 'e2e-owner', createdAt: created.createdAt, updatedAt: expect.any(String) as unknown });

      await request(e2e.server).delete(`/v1/spells/${created.id}`).set('Authorization', auth).expect(204);
      await request(e2e.server).get(`/v1/spells/${created.id}`).set('Authorization', auth).expect(404);
      await request(e2e.server).delete(`/v1/spells/${created.id}`).set('Authorization', auth).expect(404);

      expect(takeTopics(e2e.events)).toEqual([
        'internal.rmu-spells.spell.created.v1',
        'internal.rmu-spells.spell.updated.v1',
        'internal.rmu-spells.spell.deleted.v1',
      ]);
    });

    it('lists the spells of a list by name and then level, and pages them', async () => {
      const auth = e2e.auth('owner');
      const list = await request(e2e.server).post('/v1/spell-lists').set('Authorization', auth).send(spellListBody()).expect(201);
      const id = (list.body as { id: string }).id;
      for (const [name, level] of [
        ['Shield', 2],
        ['Armor', 4],
        ['Armor', 1],
      ] as const) {
        await request(e2e.server).post('/v1/spells').set('Authorization', auth).send(spellBody(id, { name, level })).expect(201);
      }

      const all = await request(e2e.server).get(`/v1/spells?q=spellListId==${id}`).set('Authorization', auth).expect(200);
      expect((all.body as { content: SpellBody[] }).content.map(spell => `${spell.name} ${spell.level}`)).toEqual([
        'Armor 1',
        'Armor 4',
        'Shield 2',
      ]);

      const page = await request(e2e.server)
        .get(`/v1/spells?q=spellListId==${id};level>1&size=1&page=1`)
        .set('Authorization', auth)
        .expect(200);
      expect(page.body).toMatchObject({ pagination: { page: 1, size: 1, totalElements: 2, totalPages: 2 } });
      expect((page.body as { content: SpellBody[] }).content[0]).toMatchObject({ name: 'Shield', level: 2 });

      await request(e2e.server).get('/v1/spells?q=level=gt=').set('Authorization', auth).expect(400);
    });
  });

  describe('validation', () => {
    it('rejects an empty body', async () => {
      const res = await request(e2e.server).post('/v1/spells').set('Authorization', e2e.auth('owner')).send({}).expect(400);
      expect(res.body).toMatchObject({ statusCode: 400, error: 'BadRequestException', code: 'bad-request', path: '/v1/spells' });
      expect((res.body as { message: unknown }).message).toEqual(expect.arrayContaining([expect.any(String)]));
    });

    it('rejects a level that is not a number and an unknown access type', async () => {
      const auth = e2e.auth('owner');
      await request(e2e.server)
        .post('/v1/spells')
        .set('Authorization', auth)
        .send(spellBody(listId, { level: 'three' }))
        .expect(400);
      await request(e2e.server)
        .post('/v1/spells')
        .set('Authorization', auth)
        .send(spellBody(listId, { accessType: 'shared' }))
        .expect(400);
    });

    it('rejects a level that is not a positive integer [F-spells-22]', async () => {
      const auth = e2e.auth('owner');
      for (const level of [-1.5, 0, 2.5]) {
        await request(e2e.server).post('/v1/spells').set('Authorization', auth).send(spellBody(listId, { level })).expect(400);
      }
      const spell = await create('owner', { level: 1 });
      await request(e2e.server).patch(`/v1/spells/${spell.id}`).set('Authorization', auth).send({ level: 0 }).expect(400);
      await request(e2e.server).patch(`/v1/spells/${spell.id}`).set('Authorization', auth).send({ level: 1.5 }).expect(400);
    });

    it('rejects a spell without modifiers [F-spells-10]', async () => {
      const auth = e2e.auth('owner');
      await request(e2e.server)
        .post('/v1/spells')
        .set('Authorization', auth)
        .send(spellBody(listId, { modifiers: undefined }))
        .expect(400);
      await request(e2e.server)
        .post('/v1/spells')
        .set('Authorization', auth)
        .send(spellBody(listId, { modifiers: 'fire' }))
        .expect(400);
    });

    it('rejects unknown modifier values [F-spells-11]', async () => {
      const auth = e2e.auth('owner');
      const invalid = [
        { type: 'chaotic' },
        { subtype: 'cloud' },
        { typeCode: 'Zz' },
        { powerPoints: -1 },
        { range: { type: 'distance', value: 'far' } },
        { range: { type: 'far' } },
        { range: { value: 10 } },
        { duration: { type: 'forever' } },
        { duration: { type: 'per-level', scale: 'century' } },
        { area: { kind: 'cone' } },
        { area: { kind: 'targets', targetTypes: ['dragon'] } },
        { area: { radius: 10 } },
        { resistance: { kind: 'magic' } },
        { resistance: { kind: 'realm', scaling: 'partial' } },
        { instant: 'yes' },
      ];
      for (const modifiers of invalid) {
        const res = await request(e2e.server)
          .post('/v1/spells')
          .set('Authorization', auth)
          .send(spellBody(listId, { modifiers: spellModifiers(modifiers) }));
        expect({ modifiers, status: res.status }).toEqual({ modifiers, status: 400 });
      }
      const spell = await create('owner');
      await request(e2e.server)
        .patch(`/v1/spells/${spell.id}`)
        .set('Authorization', auth)
        .send({ modifiers: { type: 'chaotic' } })
        .expect(400);
    });

    it('accepts the modifiers the MFE sends while the form is incomplete', async () => {
      // rmu-mfe-spells starts a new spell with `modifiers: {}` and fills only some fields.
      const empty = await create('owner', { modifiers: {} });
      expect(empty.modifiers).toMatchObject({ type: null, range: null, area: null, duration: null, resistance: null });
      const partial = await create('owner', { modifiers: { instant: false, range: { type: 'self' } } });
      expect(partial.modifiers).toMatchObject({
        instant: false,
        range: { type: 'self', value: null, perLevel: false, increment: null, raw: null },
      });
    });

    it('requires the list of the spell [F-spells-13]', async () => {
      await request(e2e.server)
        .post('/v1/spells')
        .set('Authorization', e2e.auth('owner'))
        .send(spellBody(listId, { spellListId: undefined }))
        .expect(400);
    });

    it('rejects a spell in a list that does not exist [F-spells-13]', async () => {
      await request(e2e.server).post('/v1/spells').set('Authorization', e2e.auth('owner')).send(spellBody('missing-list')).expect(404);
    });

    it('reads a stored spell without modifiers with empty modifiers [F-spells-06]', async () => {
      const auth = e2e.auth('owner');
      await e2e.connection.collection('spells').insertOne({
        _id: 'e2e-raw-spell' as never,
        spellListId: 'raw-list',
        name: 'Raw spell',
        level: 1,
        owner: 'e2e-owner',
        accessType: 'public',
        createdAt: new Date(),
      });
      const empty = {
        typeCode: null,
        type: null,
        subtype: null,
        instant: false,
        powerPoints: null,
        setGroup: null,
        range: null,
        area: null,
        duration: null,
        resistance: null,
      };
      const found = await request(e2e.server).get('/v1/spells/e2e-raw-spell').set('Authorization', auth).expect(200);
      expect(found.body).toMatchObject({ id: 'e2e-raw-spell', modifiers: empty, basedOn: null, effects: [] });
      const listed = await request(e2e.server).get('/v1/spells?q=spellListId==raw-list').set('Authorization', auth).expect(200);
      expect(ids(listed.body)).toEqual(['e2e-raw-spell']);

      // A spell stored before spec 028, whose modifiers miss some fields.
      await e2e.connection.collection('spells').updateOne(
        { _id: 'e2e-raw-spell' as never },
        {
          $set: {
            modifiers: {
              type: null,
              rrModifier: 5,
              range: { type: 'distance-level', value: 10 },
              duration: { type: 'lvl', duration: 1, durationScale: 'minute' },
              target: { mode: 'target', types: ['person'], count: 1 },
              notRequiredPowerPoints: true,
            },
          },
        },
      );
      const legacy = await request(e2e.server).get('/v1/spells/e2e-raw-spell').set('Authorization', auth).expect(200);
      expect(legacy.body).toMatchObject({
        modifiers: {
          ...empty,
          powerPoints: 0,
          range: { type: 'distance', value: 10, perLevel: true },
          duration: { type: 'per-level', value: 1, scale: 'minute', perLevel: 1 },
          area: { kind: 'targets', count: 1, targetTypes: ['person'] },
          resistance: { kind: 'realm', modifier: 5, scaling: 'all-or-nothing' },
        },
      });

      // A patch of another field keeps reading it.
      await request(e2e.server).patch('/v1/spells/e2e-raw-spell').set('Authorization', auth).send({ name: 'Raw renamed' }).expect(200);
      await e2e.connection.collection('spells').deleteOne({ _id: 'e2e-raw-spell' as never });
    });
  });

  describe('effects (spec 028)', () => {
    it('saves effects whose statuses are in the catalog of core, forwarding the token of the user', async () => {
      const auth = e2e.auth('owner');
      e2e.core.authorizations.length = 0;
      const effects = [
        stunEffect(),
        { kind: 'critical', appliesTo: 'target', requiresFailedRr: false, criticalType: 'U', severity: null, severityOffset: -1 },
        { kind: 'afflict', appliesTo: 'target', requiresFailedRr: true, afflictionType: 'disease', severity: 'light', effects: [] },
        { kind: 'narrative', appliesTo: 'self', requiresFailedRr: false, note: 'Lights a candle' },
      ];
      const spell = await create('owner', { effects });
      expect(spell.effects).toEqual(effects);
      expect(e2e.core.authorizations).toEqual([auth]);

      const found = await request(e2e.server).get(`/v1/spells/${spell.id}`).set('Authorization', auth).expect(200);
      expect((found.body as SpellBody).effects).toEqual(effects);
      const byKind = await request(e2e.server).get('/v1/spells?q=effects.kind==afflict').set('Authorization', auth).expect(200);
      expect(ids(byKind.body)).toContain(spell.id);
    });

    it('rejects an effect whose status is not in the catalog of core', async () => {
      const res = await request(e2e.server)
        .post('/v1/spells')
        .set('Authorization', e2e.auth('owner'))
        .send(spellBody(listId, { effects: [stunEffect({ status: 'flying' })] }))
        .expect(400);
      expect(res.body).toMatchObject({ code: 'unknown-effect-status' });
    });

    it('rejects an effect with a wrong shape', async () => {
      const auth = e2e.auth('owner');
      const invalid = [
        [{ kind: 'teleport', appliesTo: 'target', requiresFailedRr: false }],
        [stunEffect({ appliesTo: 'everyone' })],
        [stunEffect({ hits: 10 })],
        ['stunned'],
      ];
      for (const effects of invalid) {
        const res = await request(e2e.server).post('/v1/spells').set('Authorization', auth).send(spellBody(listId, { effects }));
        expect({ effects, status: res.status }).toEqual({ effects, status: 400 });
      }
    });

    it('answers 502 when core fails, without saving the spell', async () => {
      // A status that is not cached makes the API read the catalog again.
      e2e.core.fail = true;
      try {
        await request(e2e.server)
          .post('/v1/spells')
          .set('Authorization', e2e.auth('owner'))
          .send(spellBody(listId, { name: 'Unchecked', effects: [stunEffect({ status: 'flying' })] }))
          .expect(502);
      } finally {
        e2e.core.fail = false;
      }
      const listed = await request(e2e.server).get('/v1/spells?q=name==Unchecked').set('Authorization', e2e.auth('owner')).expect(200);
      expect(ids(listed.body)).toEqual([]);
    });

    it('replaces the effects in a patch and keeps them when they are not sent', async () => {
      const auth = e2e.auth('owner');
      const spell = await create('owner', { effects: [stunEffect()] });
      const path = `/v1/spells/${spell.id}`;
      const renamed = await request(e2e.server).patch(path).set('Authorization', auth).send({ name: 'Renamed' }).expect(200);
      expect((renamed.body as SpellBody).effects).toEqual([stunEffect()]);
      const replaced = await request(e2e.server)
        .patch(path)
        .set('Authorization', auth)
        .send({ effects: [stunEffect({ status: 'asleep', rounds: null })] })
        .expect(200);
      expect((replaced.body as SpellBody).effects).toEqual([stunEffect({ status: 'asleep', rounds: null })]);
      await request(e2e.server)
        .patch(path)
        .set('Authorization', auth)
        .send({ effects: [stunEffect({ status: 'flying' })] })
        .expect(400);
    });

    it('links a spell to the one it is based on, which must exist', async () => {
      const auth = e2e.auth('owner');
      const original = await create('owner', { name: 'Sleep I' });
      const variant = await create('owner', { name: 'Sleep III', basedOn: original.id });
      expect(variant.basedOn).toBe(original.id);
      await request(e2e.server)
        .post('/v1/spells')
        .set('Authorization', auth)
        .send(spellBody(listId, { basedOn: 'missing-spell' }))
        .expect(400);
      const cleared = await request(e2e.server)
        .patch(`/v1/spells/${variant.id}`)
        .set('Authorization', auth)
        .send({ basedOn: null })
        .expect(200);
      expect((cleared.body as SpellBody).basedOn).toBeNull();
      await request(e2e.server).patch(`/v1/spells/${variant.id}`).set('Authorization', auth).send({ basedOn: variant.id }).expect(400);
    });
  });

  describe('updates', () => {
    it('clears the description and the image with an empty string or null [F-spells-18]', async () => {
      const auth = e2e.auth('owner');
      const spell = await create('owner', { description: 'Text', imageUrl: 'https://example.com/a.png' });
      const path = `/v1/spells/${spell.id}`;
      const cleared = await request(e2e.server)
        .patch(path)
        .set('Authorization', auth)
        .send({ description: '', imageUrl: null })
        .expect(200);
      expect(cleared.body).not.toHaveProperty('description');
      expect(cleared.body).not.toHaveProperty('imageUrl');
      const again = await request(e2e.server)
        .patch(path)
        .set('Authorization', auth)
        .send({ description: 'New', imageUrl: 'https://example.com/b.png' });
      expect(again.body).toMatchObject({ description: 'New', imageUrl: 'https://example.com/b.png' });
      await request(e2e.server).patch(path).set('Authorization', auth).send({ description: null }).expect(200);
      const found = await request(e2e.server).get(path).set('Authorization', auth).expect(200);
      expect(found.body).not.toHaveProperty('description');
      await request(e2e.server).patch(path).set('Authorization', auth).send({ name: '' }).expect(400);
    });

    it('merges the patched modifiers with the stored ones [F-spells-19]', async () => {
      const auth = e2e.auth('owner');
      const spell = await create('owner');
      const path = `/v1/spells/${spell.id}`;
      const res = await request(e2e.server)
        .patch(path)
        .set('Authorization', auth)
        .send({ modifiers: { powerPoints: 5 } })
        .expect(200);
      expect((res.body as SpellBody).modifiers).toEqual({ ...spellModifiers(), powerPoints: 5 });

      // A nested object that is sent replaces the stored one, and null clears a field.
      const replaced = await request(e2e.server)
        .patch(path)
        .set('Authorization', auth)
        .send({ modifiers: { range: { type: 'touch' }, area: null, subtype: null } })
        .expect(200);
      expect((replaced.body as SpellBody).modifiers).toEqual({
        ...spellModifiers(),
        powerPoints: 5,
        range: { type: 'touch', value: null, perLevel: false, increment: null, raw: null },
        area: null,
        subtype: null,
      });

      // The MFE sends the modifiers it read: nothing changes.
      takeTopics(e2e.events);
      const same = await request(e2e.server)
        .patch(path)
        .set('Authorization', auth)
        .send({ modifiers: (replaced.body as SpellBody).modifiers, spellListId: listId })
        .expect(200);
      expect(same.body).toMatchObject({ version: (replaced.body as { version: number }).version });
      expect(takeTopics(e2e.events)).toEqual([]);
    });

    it('answers a patch without changes with the spell, without publishing an event', async () => {
      const spell = await create('owner', { name: 'Same spell' });
      takeTopics(e2e.events);
      const res = await request(e2e.server)
        .patch(`/v1/spells/${spell.id}`)
        .set('Authorization', e2e.auth('owner'))
        .send({ name: 'Same spell', version: 0 })
        .expect(200);
      expect(res.body).toMatchObject({ id: spell.id, version: 0 });
      expect(takeTopics(e2e.events)).toEqual([]);
    });

    it('rejects a patch of a stale version', async () => {
      const auth = e2e.auth('owner');
      const spell = await create('owner');
      await request(e2e.server)
        .patch(`/v1/spells/${spell.id}`)
        .set('Authorization', auth)
        .send({ name: 'New name', version: 0 })
        .expect(200);
      const res = await request(e2e.server)
        .patch(`/v1/spells/${spell.id}`)
        .set('Authorization', auth)
        .send({ name: 'Other name', version: 0 })
        .expect(409);
      expect(res.body).toMatchObject({ code: 'version-conflict' });
    });

    it('answers 404 for an unknown spell', async () => {
      await request(e2e.server).patch('/v1/spells/missing').set('Authorization', e2e.auth('owner')).send({ name: 'X' }).expect(404);
    });
  });

  describe('permissions', () => {
    it('lets players and admins create spells, but not a user without a role', async () => {
      await create('owner');
      await create('admin');
      await request(e2e.server).post('/v1/spells').set('Authorization', e2e.auth('noRole')).send(spellBody(listId)).expect(403);
    });

    it('rejects a spell in a list of another user, even a public one [F-spells-14]', async () => {
      await request(e2e.server).post('/v1/spells').set('Authorization', e2e.auth('other')).send(spellBody(listId)).expect(403);
      const publicList = await request(e2e.server)
        .post('/v1/spell-lists')
        .set('Authorization', e2e.auth('owner'))
        .send(spellListBody({ accessType: 'public' }))
        .expect(201);
      const publicListId = (publicList.body as { id: string }).id;
      await request(e2e.server).post('/v1/spells').set('Authorization', e2e.auth('other')).send(spellBody(publicListId)).expect(403);
      await request(e2e.server).post('/v1/spells').set('Authorization', e2e.auth('admin')).send(spellBody(publicListId)).expect(201);
    });

    it('lets only the owner of the list and admins create, update and delete its spells [F-spells-14]', async () => {
      const spell = await create('owner', { name: 'Matrix spell' });
      const path = `/v1/spells/${spell.id}`;
      const body = spellBody(listId);

      // Create
      await request(e2e.server).post('/v1/spells').send(body).expect(401);
      await request(e2e.server).post('/v1/spells').set('Authorization', e2e.auth('noRole')).send(body).expect(403);
      await request(e2e.server).post('/v1/spells').set('Authorization', e2e.auth('other')).send(body).expect(403);
      // Update
      await request(e2e.server).patch(path).send({ name: 'X' }).expect(401);
      await request(e2e.server).patch(path).set('Authorization', e2e.auth('noRole')).send({ name: 'X' }).expect(403);
      await request(e2e.server).patch(path).set('Authorization', e2e.auth('other')).send({ name: 'X' }).expect(403);
      await request(e2e.server).patch(path).set('Authorization', e2e.auth('owner')).send({ name: 'By owner' }).expect(200);
      await request(e2e.server).patch(path).set('Authorization', e2e.auth('admin')).send({ name: 'By admin' }).expect(200);
      // Delete
      await request(e2e.server).delete(path).expect(401);
      await request(e2e.server).delete(path).set('Authorization', e2e.auth('noRole')).expect(403);
      await request(e2e.server).delete(path).set('Authorization', e2e.auth('other')).expect(403);
      await request(e2e.server).delete(path).set('Authorization', e2e.auth('admin')).expect(204);
      const own = await create('owner');
      await request(e2e.server).delete(`/v1/spells/${own.id}`).set('Authorization', e2e.auth('owner')).expect(204);
    });

    it('lets the owner of the list change a spell that another user added to it', async () => {
      // A spell stored before spec 021 by another user, in the list of the owner.
      const spell = await create('admin', { name: 'Added by admin' });
      const path = `/v1/spells/${spell.id}`;
      await request(e2e.server).patch(path).set('Authorization', e2e.auth('owner')).send({ name: 'Taken over' }).expect(200);
      await request(e2e.server).delete(path).set('Authorization', e2e.auth('owner')).expect(204);
    });

    it('shows a private spell only to its owner and admins, and lets only them change it', async () => {
      const spell = await create('owner', { name: 'Private spell' });
      const path = `/v1/spells/${spell.id}`;

      await request(e2e.server).get(path).set('Authorization', e2e.auth('owner')).expect(200);
      await request(e2e.server).get(path).set('Authorization', e2e.auth('admin')).expect(200);
      await request(e2e.server).get(path).set('Authorization', e2e.auth('other')).expect(403);
      await request(e2e.server).patch(path).set('Authorization', e2e.auth('other')).send({ name: 'Taken' }).expect(403);
      await request(e2e.server).delete(path).set('Authorization', e2e.auth('other')).expect(403);
      await request(e2e.server).patch(path).set('Authorization', e2e.auth('admin')).send({ description: 'By admin' }).expect(200);

      const ofOther = await request(e2e.server).get('/v1/spells?size=100').set('Authorization', e2e.auth('other')).expect(200);
      expect(ids(ofOther.body)).not.toContain(spell.id);
      const ofAdmin = await request(e2e.server).get('/v1/spells?size=100').set('Authorization', e2e.auth('admin')).expect(200);
      expect(ids(ofAdmin.body)).toContain(spell.id);

      await request(e2e.server).delete(path).set('Authorization', e2e.auth('admin')).expect(204);
    });

    it('hides a public spell of a private list: the spell takes the visibility of its list [F-spells-14]', async () => {
      const spell = await create('owner', { name: 'Public spell', accessType: 'public' });
      const path = `/v1/spells/${spell.id}`;

      await request(e2e.server).get(path).set('Authorization', e2e.auth('other')).expect(403);
      await request(e2e.server).get(path).set('Authorization', e2e.auth('noRole')).expect(403);
      const listed = await request(e2e.server).get('/v1/spells?size=100').set('Authorization', e2e.auth('other')).expect(200);
      expect(ids(listed.body)).not.toContain(spell.id);
      await request(e2e.server).delete(path).set('Authorization', e2e.auth('owner')).expect(204);
    });

    it('shows a private spell of a public list to everyone, but lets only the owner of the list change it', async () => {
      const auth = e2e.auth('owner');
      const list = await request(e2e.server)
        .post('/v1/spell-lists')
        .set('Authorization', auth)
        .send(spellListBody({ accessType: 'public' }));
      const publicListId = (list.body as { id: string }).id;
      const res = await request(e2e.server)
        .post('/v1/spells')
        .set('Authorization', auth)
        .send(spellBody(publicListId, { accessType: 'private' }))
        .expect(201);
      const spell = res.body as SpellBody;
      const path = `/v1/spells/${spell.id}`;

      await request(e2e.server).get(path).set('Authorization', e2e.auth('other')).expect(200);
      await request(e2e.server).get(path).set('Authorization', e2e.auth('noRole')).expect(200);
      const listed = await request(e2e.server)
        .get(`/v1/spells?q=spellListId==${publicListId}`)
        .set('Authorization', e2e.auth('noRole'))
        .expect(200);
      expect(ids(listed.body)).toEqual([spell.id]);
      await request(e2e.server).patch(path).set('Authorization', e2e.auth('other')).send({ name: 'Taken' }).expect(403);
      await request(e2e.server).delete(path).set('Authorization', e2e.auth('noRole')).expect(403);
      await request(e2e.server).delete(path).set('Authorization', auth).expect(204);
    });

    it('keeps the own access type of a spell whose list does not exist', async () => {
      const raw = (id: string, accessType: string) => ({
        _id: id as never,
        spellListId: 'gone-list',
        name: 'Orphan spell',
        level: 1,
        modifiers: { type: 'utility' },
        owner: 'e2e-owner',
        accessType,
        createdAt: new Date(),
      });
      await e2e.connection.collection('spells').insertMany([raw('e2e-orphan-public', 'public'), raw('e2e-orphan-private', 'private')]);

      await request(e2e.server).get('/v1/spells/e2e-orphan-public').set('Authorization', e2e.auth('other')).expect(200);
      await request(e2e.server).get('/v1/spells/e2e-orphan-private').set('Authorization', e2e.auth('other')).expect(403);
      await request(e2e.server).get('/v1/spells/e2e-orphan-private').set('Authorization', e2e.auth('owner')).expect(200);
      const ofOther = await request(e2e.server)
        .get('/v1/spells?q=spellListId==gone-list')
        .set('Authorization', e2e.auth('other'))
        .expect(200);
      expect(ids(ofOther.body)).toEqual(['e2e-orphan-public']);
      const ofOwner = await request(e2e.server)
        .get('/v1/spells?q=spellListId==gone-list')
        .set('Authorization', e2e.auth('owner'))
        .expect(200);
      expect(ids(ofOwner.body).sort()).toEqual(['e2e-orphan-private', 'e2e-orphan-public']);
      await request(e2e.server)
        .patch('/v1/spells/e2e-orphan-public')
        .set('Authorization', e2e.auth('other'))
        .send({ name: 'X' })
        .expect(403);
      await request(e2e.server).delete('/v1/spells/e2e-orphan-public').set('Authorization', e2e.auth('owner')).expect(204);
      await request(e2e.server).delete('/v1/spells/e2e-orphan-private').set('Authorization', e2e.auth('admin')).expect(204);
    });

    it('moves a spell only to another list of the user [F-spells-20]', async () => {
      const auth = e2e.auth('owner');
      const spell = await create('owner');
      const path = `/v1/spells/${spell.id}`;
      const own = await request(e2e.server).post('/v1/spell-lists').set('Authorization', auth).send(spellListBody()).expect(201);
      const ofOther = await request(e2e.server)
        .post('/v1/spell-lists')
        .set('Authorization', e2e.auth('other'))
        .send(spellListBody({ accessType: 'public' }))
        .expect(201);
      const ownId = (own.body as { id: string }).id;

      await request(e2e.server).patch(path).set('Authorization', auth).send({ spellListId: 'missing-list' }).expect(404);
      await request(e2e.server)
        .patch(path)
        .set('Authorization', auth)
        .send({ spellListId: (ofOther.body as { id: string }).id })
        .expect(403);
      const moved = await request(e2e.server).patch(path).set('Authorization', auth).send({ spellListId: ownId }).expect(200);
      expect(moved.body).toMatchObject({ spellListId: ownId, version: 1 });
      // The MFE sends the whole spell back, with the list it already has.
      const same = await request(e2e.server).patch(path).set('Authorization', auth).send({ spellListId: ownId, version: 1 }).expect(200);
      expect(same.body).toMatchObject({ version: 1 });
    });
  });

  describe('target types', () => {
    it('lists the target types to any authenticated user', async () => {
      const res = await request(e2e.server).get('/v1/target-types').set('Authorization', e2e.auth('noRole')).expect(200);
      // F-spells-21: each type once.
      expect(res.body).toEqual(SPELL_TARGET_TYPES);
      expect(new Set(res.body as string[]).size).toBe(SPELL_TARGET_TYPES.length);
      await request(e2e.server).get('/v1/target-types').expect(401);
    });
  });

  // Spec 063: a spell of a list takes the source of the list; a spell without a list has its own.
  describe('alchemy (spec 064)', () => {
    const alchemy = { failureTable: 'bonus', perItem: false, alters: true, effect: { kind: 'attack', value: 10 } };

    it('creates, reads, patches and clears the alchemy metadata', async () => {
      const auth = e2e.auth('owner');
      const plain = await create('owner', { name: 'Not alchemical' });
      expect(plain.alchemy).toBeNull();

      const created = await create('owner', { name: 'Synthetic enchantment', alchemy });
      expect(created.alchemy).toEqual(alchemy);
      const found = await request(e2e.server).get(`/v1/spells/${created.id}`).set('Authorization', auth).expect(200);
      expect((found.body as SpellBody).alchemy).toEqual(alchemy);
      const listed = await request(e2e.server)
        .get('/v1/spells?q=alchemy.failureTable==bonus;name=="Synthetic enchantment"')
        .set('Authorization', auth)
        .expect(200);
      expect(ids(listed.body)).toEqual([created.id]);

      const multiplier = { failureTable: 'power-enhancer', perItem: true, alters: false, effect: { kind: 'pp-multiplier', value: 1.25 } };
      const patched = await request(e2e.server)
        .patch(`/v1/spells/${created.id}`)
        .set('Authorization', auth)
        .send({ alchemy: multiplier })
        .expect(200);
      expect((patched.body as SpellBody).alchemy).toEqual(multiplier);

      // Another field keeps it; null clears it.
      const renamed = await request(e2e.server)
        .patch(`/v1/spells/${created.id}`)
        .set('Authorization', auth)
        .send({ name: 'Renamed' })
        .expect(200);
      expect((renamed.body as SpellBody).alchemy).toEqual(multiplier);
      const cleared = await request(e2e.server)
        .patch(`/v1/spells/${created.id}`)
        .set('Authorization', auth)
        .send({ alchemy: null })
        .expect(200);
      expect((cleared.body as SpellBody).alchemy).toBeNull();
      const reread = await request(e2e.server).get(`/v1/spells/${created.id}`).set('Authorization', auth).expect(200);
      expect((reread.body as SpellBody).alchemy).toBeNull();

      const withoutEffect = await request(e2e.server)
        .patch(`/v1/spells/${created.id}`)
        .set('Authorization', auth)
        .send({ alchemy: { failureTable: 'general', perItem: false, alters: false, effect: null } })
        .expect(200);
      expect((withoutEffect.body as SpellBody).alchemy).toEqual({ failureTable: 'general', perItem: false, alters: false, effect: null });
    });

    it('rejects invalid alchemy metadata', async () => {
      const auth = e2e.auth('owner');
      const invalid = [
        'bonus',
        { ...alchemy, failureTable: 'unknown' },
        { ...alchemy, perItem: 'yes' },
        { failureTable: 'bonus', alters: false },
        { ...alchemy, effect: { kind: 'speed', value: 1 } },
        { ...alchemy, effect: { kind: 'attack', value: 'ten' } },
        { ...alchemy, effect: { kind: 'attack' } },
      ];
      const spell = await create('owner', { alchemy });
      for (const value of invalid) {
        await request(e2e.server)
          .post('/v1/spells')
          .set('Authorization', auth)
          .send(spellBody(listId, { alchemy: value }))
          .expect(400);
        await request(e2e.server).patch(`/v1/spells/${spell.id}`).set('Authorization', auth).send({ alchemy: value }).expect(400);
      }
    });

    it('reads a stored spell without alchemy as null', async () => {
      const auth = e2e.auth('owner');
      await e2e.connection.collection('spells').insertOne({
        _id: 'e2e-raw-alchemy' as never,
        spellListId: listId,
        name: 'Raw spell without alchemy',
        level: 1,
        owner: 'e2e-owner',
        accessType: 'public',
        createdAt: new Date(),
      });
      const found = await request(e2e.server).get('/v1/spells/e2e-raw-alchemy').set('Authorization', auth).expect(200);
      expect((found.body as SpellBody).alchemy).toBeNull();
      await e2e.connection.collection('spells').deleteOne({ _id: 'e2e-raw-alchemy' as never });
    });
  });

  describe('entity source', () => {
    const patch = (user: UserName, id: string, body: Record<string, unknown>) =>
      request(e2e.server).patch(`/v1/spells/${id}`).set('Authorization', e2e.auth(user)).send(body);
    const del = (user: UserName, id: string) => request(e2e.server).delete(`/v1/spells/${id}`).set('Authorization', e2e.auth(user));

    /** A public list of the owner that an admin moved to the rulebook. */
    const systemList = async () => {
      const res = await request(e2e.server)
        .post('/v1/spell-lists')
        .set('Authorization', e2e.auth('owner'))
        .send(spellListBody({ accessType: 'public' }))
        .expect(201);
      const id = (res.body as { id: string }).id;
      await request(e2e.server)
        .patch(`/v1/spell-lists/${id}`)
        .set('Authorization', e2e.auth('admin'))
        .send({ entitySource: 'system' })
        .expect(200);
      return id;
    };

    it('copies the source of the list on create, whatever the request says', async () => {
      expect(await create('owner')).toMatchObject({ entitySource: 'user' });
      expect(await create('owner', { entitySource: 'system' })).toMatchObject({ entitySource: 'user' });
      const id = await systemList();
      const res = await request(e2e.server)
        .post('/v1/spells')
        .set('Authorization', e2e.auth('admin'))
        .send(spellBody(id, { entitySource: 'user' }))
        .expect(201);
      expect(res.body).toMatchObject({ entitySource: 'system', owner: 'e2e-admin' });
    });

    it('lets only an admin add, change or delete the spells of a system list', async () => {
      const id = await systemList();
      const denied = await request(e2e.server).post('/v1/spells').set('Authorization', e2e.auth('owner')).send(spellBody(id)).expect(403);
      expect(denied.body).toMatchObject({ statusCode: 403, code: 'system-entity-admin-only' });

      const spell = (await request(e2e.server).post('/v1/spells').set('Authorization', e2e.auth('admin')).send(spellBody(id)).expect(201))
        .body as { id: string };
      const patched = await patch('owner', spell.id, { name: 'Mine' }).expect(403);
      expect(patched.body).toMatchObject({ code: 'system-entity-admin-only' });
      const deleted = await del('owner', spell.id).expect(403);
      expect(deleted.body).toMatchObject({ code: 'system-entity-admin-only' });
      await patch('admin', spell.id, { name: 'By admin' }).expect(200);
      await del('admin', spell.id).expect(204);
    });

    it('lets the owner of a user list and an admin change its spells', async () => {
      const spell = await create('owner');
      await patch('owner', spell.id, { name: 'By owner' }).expect(200);
      await patch('admin', spell.id, { name: 'By admin' }).expect(200);
      const other = await patch('other', spell.id, { name: 'Taken' }).expect(403);
      expect(other.body).toMatchObject({ code: 'forbidden' });
      await del('owner', spell.id).expect(204);
    });

    it('rejects a patch that sends the source of a spell of a list, even from an admin', async () => {
      const spell = await create('owner');
      for (const user of ['owner', 'admin'] as const) {
        const res = await patch(user, spell.id, { entitySource: 'user' }).expect(400);
        expect(res.body).toMatchObject({ statusCode: 400, code: 'spell-source-follows-list' });
      }
    });

    it('gives a spell moved to a system list the source of that list', async () => {
      const spell = await create('owner');
      const id = await systemList();
      const moved = await patch('admin', spell.id, { spellListId: id }).expect(200);
      expect(moved.body).toMatchObject({ spellListId: id, entitySource: 'system' });
    });

    it('keeps the own source of a spell without a list, read as user when it has none', async () => {
      await e2e.connection.collection('spells').insertOne({
        _id: 'e2e-standalone' as never,
        spellListId: 'no-such-list',
        name: 'Standalone spell',
        level: 1,
        modifiers: { type: 'utility' },
        owner: 'e2e-owner',
        accessType: 'public',
        createdAt: new Date(),
      });
      const found = await request(e2e.server).get('/v1/spells/e2e-standalone').set('Authorization', e2e.auth('owner')).expect(200);
      expect(found.body).toMatchObject({ entitySource: 'user' });

      await patch('owner', 'e2e-standalone', { name: 'By owner' }).expect(200);
      const denied = await patch('owner', 'e2e-standalone', { entitySource: 'system' }).expect(403);
      expect(denied.body).toMatchObject({ code: 'system-entity-admin-only' });
      const promoted = await patch('admin', 'e2e-standalone', { entitySource: 'system' }).expect(200);
      expect(promoted.body).toMatchObject({ entitySource: 'system', owner: 'e2e-owner' });

      const patched = await patch('owner', 'e2e-standalone', { name: 'Mine' }).expect(403);
      expect(patched.body).toMatchObject({ code: 'system-entity-admin-only' });
      const deleted = await del('owner', 'e2e-standalone').expect(403);
      expect(deleted.body).toMatchObject({ code: 'system-entity-admin-only' });
      await del('admin', 'e2e-standalone').expect(204);
    });
  });
});

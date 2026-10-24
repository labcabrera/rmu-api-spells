import request from 'supertest';
import { type E2eApp, ids, startApp, takeTopics, type UserName } from './support/app.js';
import { spellBody, spellListBody, spellModifiers } from './support/fixtures.js';

type SpellBody = {
  id: string;
  spellListId?: string;
  name: string;
  level: number;
  accessType: string;
  description?: string;
  modifiers: Record<string, unknown>;
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
      expect(created).toMatchObject({
        name: 'Fire Bolt',
        level: 5,
        spellListId: listId,
        accessType: 'private',
        description: 'A spell of the suite',
        modifiers: spellModifiers(),
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

    // F-spells-22: the level is any number.
    it('accepts a negative or fractional level', async () => {
      const spell = await create('owner', { level: -1.5 });
      expect(spell.level).toBe(-1.5);
    });

    // F-spells-10: modifiers are optional in the DTO, but the controller reads them.
    it('fails with 500 when the modifiers are missing', async () => {
      const res = await request(e2e.server)
        .post('/v1/spells')
        .set('Authorization', e2e.auth('owner'))
        .send(spellBody(listId, { modifiers: undefined }))
        .expect(500);
      // The body never shows the internal error.
      expect(res.body).toMatchObject({
        statusCode: 500,
        error: 'InternalServerError',
        code: 'internal-error',
        message: 'Internal server error',
      });
    });

    it.skip('rejects a spell without modifiers [F-spells-10]', async () => {
      await request(e2e.server)
        .post('/v1/spells')
        .set('Authorization', e2e.auth('owner'))
        .send(spellBody(listId, { modifiers: undefined }))
        .expect(400);
    });

    // F-spells-11: the nested modifiers are not validated.
    it('accepts unknown modifier values and fails with 500 on a value Mongo cannot cast', async () => {
      const spell = await create('owner', { modifiers: spellModifiers({ type: 'chaotic', subtype: 'cloud' }) });
      expect(spell.modifiers).toMatchObject({ type: 'chaotic', subtype: 'cloud' });
      await request(e2e.server)
        .post('/v1/spells')
        .set('Authorization', e2e.auth('owner'))
        .send(spellBody(listId, { modifiers: spellModifiers({ range: { type: 'distance', value: 'far' } }) }))
        .expect(500);
    });

    it.skip('rejects unknown modifier values [F-spells-11]', async () => {
      await request(e2e.server)
        .post('/v1/spells')
        .set('Authorization', e2e.auth('owner'))
        .send(spellBody(listId, { modifiers: spellModifiers({ type: 'chaotic' }) }))
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
        type: null,
        subtype: null,
        range: null,
        duration: null,
        target: null,
        rrModifier: null,
        instant: null,
        notRequiredPowerPoints: null,
        partOfSetOfSpells: null,
      };
      const found = await request(e2e.server).get('/v1/spells/e2e-raw-spell').set('Authorization', auth).expect(200);
      expect(found.body).toMatchObject({ id: 'e2e-raw-spell', modifiers: empty });
      const listed = await request(e2e.server).get('/v1/spells?q=spellListId==raw-list').set('Authorization', auth).expect(200);
      expect(ids(listed.body)).toEqual(['e2e-raw-spell']);

      // A spell whose modifiers miss some fields, with a null type.
      await e2e.connection
        .collection('spells')
        .updateOne({ _id: 'e2e-raw-spell' as never }, { $set: { modifiers: { type: null, rrModifier: 5 } } });
      const partial = await request(e2e.server).get('/v1/spells/e2e-raw-spell').set('Authorization', auth).expect(200);
      expect(partial.body).toMatchObject({ modifiers: { ...empty, rrModifier: 5 } });

      // A patch of another field keeps reading it.
      await request(e2e.server).patch('/v1/spells/e2e-raw-spell').set('Authorization', auth).send({ name: 'Raw renamed' }).expect(200);
      await e2e.connection.collection('spells').deleteOne({ _id: 'e2e-raw-spell' as never });
    });
  });

  describe('updates', () => {
    // F-spells-18: falsy values do not change the spell.
    it('ignores a level of 0 and an empty description', async () => {
      const spell = await create('owner', { level: 4, description: 'Text' });
      const res = await request(e2e.server)
        .patch(`/v1/spells/${spell.id}`)
        .set('Authorization', e2e.auth('owner'))
        .send({ level: 0, description: '' })
        .expect(200);
      expect(res.body).toMatchObject({ level: 4, description: 'Text' });
    });

    // F-spells-19: the modifiers are replaced as a whole.
    it('replaces all the modifiers with the patched ones', async () => {
      const spell = await create('owner');
      const res = await request(e2e.server)
        .patch(`/v1/spells/${spell.id}`)
        .set('Authorization', e2e.auth('owner'))
        .send({ modifiers: { rrModifier: 5 } })
        .expect(200);
      expect((res.body as SpellBody).modifiers).toMatchObject({ type: null, range: null, duration: null, target: null, rrModifier: 5 });
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
      // F-spells-21: 'other' comes twice.
      expect(res.body).toEqual(['person', 'item', 'spell', 'gateway', 'lock', 'other', 'plant', 'animal', 'other']);
      await request(e2e.server).get('/v1/target-types').expect(401);
    });
  });
});

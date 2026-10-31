import request from 'supertest';
import { type E2eApp, ids, startApp, takeTopics, type UserName } from './support/app.js';
import { spellBody, spellListBody } from './support/fixtures.js';

type SpellListBody = {
  id: string;
  name: string;
  realms: string[];
  realm: string;
  type: string;
  professionId: string | null;
  description?: string;
};

describe('Spell lists (e2e)', () => {
  let e2e: E2eApp;

  beforeAll(async () => {
    e2e = await startApp();
  });

  afterAll(async () => {
    await e2e?.stop();
  });

  const create = async (user: UserName, overrides: Record<string, unknown> = {}) => {
    const res = await request(e2e.server)
      .post('/v1/spell-lists')
      .set('Authorization', e2e.auth(user))
      .send(spellListBody(overrides))
      .expect(201);
    return res.body as SpellListBody;
  };

  describe('authentication', () => {
    it('rejects a request without a token', async () => {
      await request(e2e.server).get('/v1/spell-lists').expect(401);
    });

    it('rejects a token signed with another key', async () => {
      await request(e2e.server).get('/v1/spell-lists').set('Authorization', 'Bearer a.b.c').expect(401);
    });

    it('rejects an expired token', async () => {
      const now = Math.floor(Date.now() / 1000);
      const token = e2e.jwks.token({ sub: 'e2e-owner', groups: ['rmu-user'], exp: now - 60 });
      await request(e2e.server).get('/v1/spell-lists').set('Authorization', `Bearer ${token}`).expect(401);
    });
  });

  describe('CRUD', () => {
    it('creates, reads, lists, updates and deletes a spell list, publishing its events', async () => {
      const auth = e2e.auth('owner');
      takeTopics(e2e.events);

      const created = await create('owner', { name: 'Fire Law', realms: ['essence'], type: 'open' });
      expect(created).toMatchObject({ name: 'Fire Law', realms: ['essence'], realm: 'essence', type: 'open', professionId: null });
      expect(created).toMatchObject({ accessType: 'private', code: null, bookSection: null });
      // F-spells-26: the response says who owns the list and when it changed.
      expect(created).toMatchObject({ owner: 'e2e-owner', createdAt: expect.any(String) as unknown, updatedAt: null });

      const found = await request(e2e.server).get(`/v1/spell-lists/${created.id}`).set('Authorization', auth).expect(200);
      expect(found.body).toMatchObject({ id: created.id, name: 'Fire Law' });

      const listed = await request(e2e.server).get('/v1/spell-lists?q=name=="Fire Law"').set('Authorization', auth).expect(200);
      expect(ids(listed.body)).toEqual([created.id]);
      expect(listed.body).toMatchObject({ pagination: { page: 0, size: 10, totalElements: 1, totalPages: 1 } });

      const updated = await request(e2e.server)
        .patch(`/v1/spell-lists/${created.id}`)
        .set('Authorization', auth)
        .send({ name: 'Fire Mastery', realms: ['channeling'], description: 'Changed' })
        .expect(200);
      expect(updated.body).toMatchObject({ name: 'Fire Mastery', realms: ['channeling'], description: 'Changed' });

      await request(e2e.server).delete(`/v1/spell-lists/${created.id}`).set('Authorization', auth).expect(204);
      await request(e2e.server).get(`/v1/spell-lists/${created.id}`).set('Authorization', auth).expect(404);
      await request(e2e.server).delete(`/v1/spell-lists/${created.id}`).set('Authorization', auth).expect(404);

      expect(takeTopics(e2e.events)).toEqual([
        'internal.rmu-spells.spell-list.created.v1',
        'internal.rmu-spells.spell-list.updated.v1',
        'internal.rmu-spells.spell-list.deleted.v1',
      ]);
    });

    it('publishes the whole spell list in the event, with the owner', async () => {
      takeTopics(e2e.events);
      const list = await create('owner', { name: 'Event list' });
      const [event] = e2e.events.splice(0);
      expect(event.topic).toBe('internal.rmu-spells.spell-list.created.v1');
      // F-spells-09: the producer is the Kafka client id of the API.
      expect(event.message).toMatchObject({
        eventType: 'created',
        eventVersion: '1',
        producer: 'rmu-api-spells-e2e',
        data: { id: list.id, name: 'Event list', owner: 'e2e-owner', accessType: 'private' },
      });
    });

    it('searches with RSQL (=re= matches text, not a pattern), sorts by name and pages the results', async () => {
      const auth = e2e.auth('owner');
      for (const name of ['Search C', 'Search A', 'Search B']) await create('owner', { name });

      const all = await request(e2e.server).get('/v1/spell-lists?q=name=re=search').set('Authorization', auth).expect(200);
      expect((all.body as { content: SpellListBody[] }).content.map(list => list.name)).toEqual(['Search A', 'Search B', 'Search C']);

      const page = await request(e2e.server).get('/v1/spell-lists?q=name=re=search&size=2&page=1').set('Authorization', auth).expect(200);
      expect(page.body).toMatchObject({ pagination: { page: 1, size: 2, totalElements: 3, totalPages: 2 } });
      expect(ids(page.body)).toHaveLength(1);

      const none = await request(e2e.server).get('/v1/spell-lists?q=name==Missing').set('Authorization', auth).expect(200);
      expect(ids(none.body)).toEqual([]);
      const pattern = await request(e2e.server).get('/v1/spell-lists?q=name=re=^search').set('Authorization', auth).expect(200);
      expect(ids(pattern.body)).toEqual([]);
    });

    it('rejects an invalid RSQL expression and an invalid page size', async () => {
      const auth = e2e.auth('owner');
      const res = await request(e2e.server).get('/v1/spell-lists?q=name==').set('Authorization', auth).expect(400);
      // F-receta-22: the path of the error has no query string.
      expect(res.body).toMatchObject({
        statusCode: 400,
        error: 'InvalidSearchExpression',
        code: 'invalid-search',
        path: '/v1/spell-lists',
      });
      await request(e2e.server).get('/v1/spell-lists?q=$where==1').set('Authorization', auth).expect(400);
      await request(e2e.server).get('/v1/spell-lists?size=0').set('Authorization', auth).expect(400);
      await request(e2e.server).get('/v1/spell-lists?page=-1').set('Authorization', auth).expect(400);
    });

    it('pages up to 1000 lists, as a catalog loaded whole (spec 056)', async () => {
      const auth = e2e.auth('owner');
      await request(e2e.server).get('/v1/spell-lists?size=1000').set('Authorization', auth).expect(200);
      const res = await request(e2e.server).get('/v1/spell-lists?size=1001').set('Authorization', auth).expect(400);
      expect(res.body).toMatchObject({ statusCode: 400, error: 'BadRequestException', code: 'bad-request' });
    });

    it('creates a base list of a profession and a public list by default', async () => {
      const base = await create('owner', { type: 'base', professionId: 'mage' });
      expect(base).toMatchObject({ type: 'base', professionId: 'mage' });
      const res = await request(e2e.server)
        .post('/v1/spell-lists')
        .set('Authorization', e2e.auth('owner'))
        .send(spellListBody({ accessType: undefined }))
        .expect(201);
      expect(res.body).toMatchObject({ accessType: 'public' });
    });

    it('does not delete a list that still has spells [F-spells-15]', async () => {
      const auth = e2e.auth('owner');
      const list = await create('owner');
      const spell = await request(e2e.server).post('/v1/spells').set('Authorization', auth).send(spellBody(list.id)).expect(201);
      takeTopics(e2e.events);
      const res = await request(e2e.server).delete(`/v1/spell-lists/${list.id}`).set('Authorization', auth).expect(409);
      expect(res.body).toMatchObject({ statusCode: 409, error: 'ConflictError', code: 'has-spells' });
      expect(takeTopics(e2e.events)).toEqual([]);
      await request(e2e.server).get(`/v1/spell-lists/${list.id}`).set('Authorization', auth).expect(200);

      await request(e2e.server)
        .delete(`/v1/spells/${(spell.body as { id: string }).id}`)
        .set('Authorization', auth)
        .expect(204);
      await request(e2e.server).delete(`/v1/spell-lists/${list.id}`).set('Authorization', auth).expect(204);
    });
  });

  describe('validation', () => {
    it('rejects an empty body', async () => {
      const res = await request(e2e.server).post('/v1/spell-lists').set('Authorization', e2e.auth('owner')).send({}).expect(400);
      expect((res.body as { message: unknown }).message).toEqual(expect.arrayContaining([expect.any(String)]));
    });

    it('requires a profession in a base list and rejects it in the others', async () => {
      const auth = e2e.auth('owner');
      await request(e2e.server)
        .post('/v1/spell-lists')
        .set('Authorization', auth)
        .send(spellListBody({ type: 'base' }))
        .expect(400);
      const res = await request(e2e.server)
        .post('/v1/spell-lists')
        .set('Authorization', auth)
        .send(spellListBody({ type: 'open', professionId: 'mage' }))
        .expect(400);
      // F-spells-17: a message for each case.
      expect(res.body).toMatchObject({ error: 'ValidationError', message: 'Only a base spell list has a professionId' });
    });

    it('rejects an unknown access type', async () => {
      await request(e2e.server)
        .post('/v1/spell-lists')
        .set('Authorization', e2e.auth('owner'))
        .send(spellListBody({ accessType: 'shared' }))
        .expect(400);
    });

    it('rejects an unknown realm or type [F-spells-12]', async () => {
      const auth = e2e.auth('owner');
      await request(e2e.server)
        .post('/v1/spell-lists')
        .set('Authorization', auth)
        .send(spellListBody({ realms: ['arcane'] }))
        .expect(400);
      for (const realms of [[], ['essence', 'essence'], ['essence', 'channeling', 'mentalism']]) {
        const res = await request(e2e.server).post('/v1/spell-lists').set('Authorization', auth).send(spellListBody({ realms }));
        expect({ realms, status: res.status }).toEqual({ realms, status: 400 });
      }
      await request(e2e.server)
        .post('/v1/spell-lists')
        .set('Authorization', auth)
        .send(spellListBody({ type: 'secret' }))
        .expect(400);
      const list = await create('owner');
      await request(e2e.server)
        .patch(`/v1/spell-lists/${list.id}`)
        .set('Authorization', auth)
        .send({ realms: ['void'] })
        .expect(400);
      await request(e2e.server).patch(`/v1/spell-lists/${list.id}`).set('Authorization', auth).send({ type: 'secret' }).expect(400);
      await request(e2e.server).patch(`/v1/spell-lists/${list.id}`).set('Authorization', auth).send({ name: '' }).expect(400);
    });

    it('keeps hybrid realms, evil lists and the book reference (spec 028)', async () => {
      const auth = e2e.auth('owner');
      const hybrid = await create('owner', {
        realms: ['channeling', 'mentalism'],
        type: 'base',
        professionId: 'healer',
        code: 'blood-ways',
        bookSection: '9.1',
      });
      expect(hybrid).toMatchObject({ realms: ['channeling', 'mentalism'], realm: 'channeling', code: 'blood-ways', bookSection: '9.1' });
      const evil = await create('owner', { realms: ['essence'], type: 'evil' });
      expect(evil).toMatchObject({ type: 'evil' });

      const byRealm = await request(e2e.server).get('/v1/spell-lists?q=realms==mentalism').set('Authorization', auth).expect(200);
      expect(ids(byRealm.body)).toContain(hybrid.id);
      expect(ids(byRealm.body)).not.toContain(evil.id);
      const byCode = await request(e2e.server).get('/v1/spell-lists?q=code==blood-ways').set('Authorization', auth).expect(200);
      expect(ids(byCode.body)).toEqual([hybrid.id]);
    });

    it('accepts and reads the deprecated realm', async () => {
      const auth = e2e.auth('owner');
      const legacy = await create('owner', { realms: undefined, realm: 'mentalism' });
      expect(legacy).toMatchObject({ realms: ['mentalism'], realm: 'mentalism' });
      const patched = await request(e2e.server)
        .patch(`/v1/spell-lists/${legacy.id}`)
        .set('Authorization', auth)
        .send({ realm: 'essence' })
        .expect(200);
      expect(patched.body).toMatchObject({ realms: ['essence'] });

      // A list stored before spec 028, with `realm` and no `realms`.
      await e2e.connection.collection('spell-lists').insertOne({
        _id: 'e2e-legacy-list' as never,
        name: 'Legacy list',
        realm: 'channeling',
        type: 'open',
        owner: 'e2e-owner',
        accessType: 'private',
        createdAt: new Date(),
      });
      const stored = await request(e2e.server).get('/v1/spell-lists/e2e-legacy-list').set('Authorization', auth).expect(200);
      expect(stored.body).toMatchObject({ realms: ['channeling'], realm: 'channeling', code: null, bookSection: null });
      await e2e.connection.collection('spell-lists').deleteOne({ _id: 'e2e-legacy-list' as never });
    });

    it('drops unknown fields of the body', async () => {
      const list = await create('owner', { owner: 'someone-else', unknown: 'value' });
      expect(list).not.toHaveProperty('unknown');
      const stored = await e2e.connection.collection('spell-lists').findOne({ _id: list.id as never });
      expect(stored).toMatchObject({ owner: 'e2e-owner' });
      expect(stored).not.toHaveProperty('unknown');
    });
  });

  describe('names', () => {
    it('rejects a name the user already has, but not one of another user [F-spells-16]', async () => {
      await create('owner', { name: 'Unique name', accessType: 'private' });
      const res = await request(e2e.server)
        .post('/v1/spell-lists')
        .set('Authorization', e2e.auth('owner'))
        .send(spellListBody({ name: 'Unique name' }))
        .expect(409);
      expect(res.body).toMatchObject({ error: 'ConflictError', code: 'name-in-use', message: 'Name already in use' });
      await create('other', { name: 'Unique name' });
    });

    it('accepts a name with a double quote [F-spells-16]', async () => {
      const list = await create('owner', { name: 'The "true" fire' });
      expect(list.name).toBe('The "true" fire');
    });

    it('rejects renaming a list to a name the owner already has [F-spells-16]', async () => {
      await create('owner', { name: 'Taken name' });
      const list = await create('owner', { name: 'Free name' });
      const path = `/v1/spell-lists/${list.id}`;
      const res = await request(e2e.server).patch(path).set('Authorization', e2e.auth('owner')).send({ name: 'Taken name' }).expect(409);
      expect(res.body).toMatchObject({ code: 'name-in-use' });
      // Its own name, as the MFE sends it back with the other fields.
      await request(e2e.server)
        .patch(path)
        .set('Authorization', e2e.auth('owner'))
        .send({ name: 'Free name', description: 'New' })
        .expect(200);
    });
  });

  describe('updates', () => {
    it('clears the description and the image with an empty string or null [F-spells-18]', async () => {
      const list = await create('owner', { description: 'Long text', imageUrl: 'https://example.com/a.png' });
      const res = await request(e2e.server)
        .patch(`/v1/spell-lists/${list.id}`)
        .set('Authorization', e2e.auth('owner'))
        .send({ description: '', imageUrl: null })
        .expect(200);
      expect(res.body).toMatchObject({ description: null, imageUrl: null });
    });

    it('answers a patch without changes with the list, without writing it or publishing an event', async () => {
      const list = await create('owner', { name: 'Unchanged list' });
      takeTopics(e2e.events);
      const res = await request(e2e.server)
        .patch(`/v1/spell-lists/${list.id}`)
        .set('Authorization', e2e.auth('owner'))
        .send({ name: 'Unchanged list' })
        .expect(200);
      expect(res.body).toMatchObject({ id: list.id, name: 'Unchanged list', version: 0 });
      expect(takeTopics(e2e.events)).toEqual([]);
    });

    it('moves the version on each change and rejects a patch of a stale version', async () => {
      const auth = e2e.auth('owner');
      const list = await create('owner');
      expect(list).toMatchObject({ version: 0 });
      const first = await request(e2e.server)
        .patch(`/v1/spell-lists/${list.id}`)
        .set('Authorization', auth)
        .send({ description: 'First', version: 0 })
        .expect(200);
      expect(first.body).toMatchObject({ description: 'First', version: 1 });
      const stale = await request(e2e.server)
        .patch(`/v1/spell-lists/${list.id}`)
        .set('Authorization', auth)
        .send({ description: 'Second', version: 0 })
        .expect(409);
      expect(stale.body).toMatchObject({ statusCode: 409, error: 'ConflictError', code: 'version-conflict' });
      const found = await request(e2e.server).get(`/v1/spell-lists/${list.id}`).set('Authorization', auth).expect(200);
      expect(found.body).toMatchObject({ description: 'First', version: 1 });
      await request(e2e.server).patch(`/v1/spell-lists/${list.id}`).set('Authorization', auth).send({ version: -1 }).expect(400);
    });

    it('reads a list stored before versions existed as version 0', async () => {
      const auth = e2e.auth('owner');
      const list = await create('owner');
      await e2e.connection.collection('spell-lists').updateOne({ _id: list.id as never }, { $unset: { version: 1 } });
      const found = await request(e2e.server).get(`/v1/spell-lists/${list.id}`).set('Authorization', auth).expect(200);
      expect(found.body).toMatchObject({ version: 0 });
      const updated = await request(e2e.server)
        .patch(`/v1/spell-lists/${list.id}`)
        .set('Authorization', auth)
        .send({ description: 'Migrated', version: 0 })
        .expect(200);
      expect(updated.body).toMatchObject({ version: 1 });
    });

    it('turns a list into a base list only with a profession', async () => {
      const auth = e2e.auth('owner');
      const list = await create('owner');
      await request(e2e.server).patch(`/v1/spell-lists/${list.id}`).set('Authorization', auth).send({ type: 'base' }).expect(400);
      const res = await request(e2e.server)
        .patch(`/v1/spell-lists/${list.id}`)
        .set('Authorization', auth)
        .send({ type: 'base', professionId: 'cleric' })
        .expect(200);
      expect(res.body).toMatchObject({ type: 'base', professionId: 'cleric' });
    });

    it('answers 404 for an unknown list', async () => {
      await request(e2e.server).patch('/v1/spell-lists/missing').set('Authorization', e2e.auth('owner')).send({ name: 'X' }).expect(404);
    });
  });

  describe('permissions', () => {
    it('lets players and admins create lists, but not a user without a role', async () => {
      await create('owner');
      await create('admin');
      const res = await request(e2e.server)
        .post('/v1/spell-lists')
        .set('Authorization', e2e.auth('noRole'))
        .send(spellListBody())
        .expect(403);
      expect(res.body).toMatchObject({ error: 'ForbiddenError' });
    });

    it('shows a private list only to its owner and admins, and lets only them change it', async () => {
      const list = await create('owner', { name: 'Private list' });
      const path = `/v1/spell-lists/${list.id}`;

      await request(e2e.server).get(path).set('Authorization', e2e.auth('owner')).expect(200);
      await request(e2e.server).get(path).set('Authorization', e2e.auth('admin')).expect(200);
      await request(e2e.server).get(path).set('Authorization', e2e.auth('other')).expect(403);
      await request(e2e.server).get(path).set('Authorization', e2e.auth('noRole')).expect(403);
      await request(e2e.server).patch(path).set('Authorization', e2e.auth('other')).send({ name: 'Taken' }).expect(403);
      await request(e2e.server).delete(path).set('Authorization', e2e.auth('other')).expect(403);
      await request(e2e.server).patch(path).set('Authorization', e2e.auth('admin')).send({ description: 'By admin' }).expect(200);

      const ofOther = await request(e2e.server).get('/v1/spell-lists?size=100').set('Authorization', e2e.auth('other')).expect(200);
      expect(ids(ofOther.body)).not.toContain(list.id);
      const ofAdmin = await request(e2e.server).get('/v1/spell-lists?size=100').set('Authorization', e2e.auth('admin')).expect(200);
      expect(ids(ofAdmin.body)).toContain(list.id);

      await request(e2e.server).delete(path).set('Authorization', e2e.auth('admin')).expect(204);
    });

    it('answers 401 without a token and 403 without a role to create, update and delete', async () => {
      const list = await create('owner', { accessType: 'public' });
      const path = `/v1/spell-lists/${list.id}`;
      await request(e2e.server).post('/v1/spell-lists').send(spellListBody()).expect(401);
      await request(e2e.server).patch(path).send({ name: 'X' }).expect(401);
      await request(e2e.server).delete(path).expect(401);
      await request(e2e.server).patch(path).set('Authorization', e2e.auth('noRole')).send({ name: 'X' }).expect(403);
      await request(e2e.server).delete(path).set('Authorization', e2e.auth('other')).expect(403);
      await request(e2e.server).delete(path).set('Authorization', e2e.auth('owner')).expect(204);
    });

    it('shows a public list to everyone but lets only its owner and admins change it', async () => {
      const list = await create('owner', { name: 'Public list', accessType: 'public' });
      const path = `/v1/spell-lists/${list.id}`;

      await request(e2e.server).get(path).set('Authorization', e2e.auth('other')).expect(200);
      await request(e2e.server).get(path).set('Authorization', e2e.auth('noRole')).expect(200);
      const listed = await request(e2e.server).get('/v1/spell-lists?size=100').set('Authorization', e2e.auth('noRole')).expect(200);
      expect(ids(listed.body)).toContain(list.id);

      await request(e2e.server).patch(path).set('Authorization', e2e.auth('other')).send({ name: 'Taken' }).expect(403);
      await request(e2e.server).delete(path).set('Authorization', e2e.auth('noRole')).expect(403);
      await request(e2e.server).delete(path).set('Authorization', e2e.auth('owner')).expect(204);
    });
  });
});

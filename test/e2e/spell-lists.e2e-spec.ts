import request from 'supertest';
import { type E2eApp, ids, startApp, takeTopics, type UserName } from './support/app.js';
import { spellBody, spellListBody } from './support/fixtures.js';

type SpellListBody = { id: string; name: string; realm: string; type: string; professionId: string | null; description?: string };

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

      const created = await create('owner', { name: 'Fire Law', realm: 'essence', type: 'open' });
      expect(created).toMatchObject({ name: 'Fire Law', realm: 'essence', type: 'open', professionId: null, accessType: 'private' });

      const found = await request(e2e.server).get(`/v1/spell-lists/${created.id}`).set('Authorization', auth).expect(200);
      expect(found.body).toMatchObject({ id: created.id, name: 'Fire Law' });

      const listed = await request(e2e.server).get('/v1/spell-lists?q=name=="Fire Law"').set('Authorization', auth).expect(200);
      expect(ids(listed.body)).toEqual([created.id]);
      expect(listed.body).toMatchObject({ pagination: { page: 0, size: 10, totalElements: 1, totalPages: 1 } });

      const updated = await request(e2e.server)
        .patch(`/v1/spell-lists/${created.id}`)
        .set('Authorization', auth)
        .send({ name: 'Fire Mastery', realm: 'channeling', description: 'Changed' })
        .expect(200);
      expect(updated.body).toMatchObject({ name: 'Fire Mastery', realm: 'channeling', description: 'Changed' });

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
      // F-spells-09: the producer of the spells events says rmu-api-core.
      expect(event.message).toMatchObject({
        eventType: 'created',
        eventVersion: '1',
        producer: 'rmu-api-core',
        data: { id: list.id, name: 'Event list', owner: 'e2e-owner', accessType: 'private' },
      });
    });

    it('searches with RSQL, sorts by name and pages the results', async () => {
      const auth = e2e.auth('owner');
      for (const name of ['Search C', 'Search A', 'Search B']) await create('owner', { name });

      const all = await request(e2e.server).get('/v1/spell-lists?q=name=re=^search').set('Authorization', auth).expect(200);
      expect((all.body as { content: SpellListBody[] }).content.map(list => list.name)).toEqual(['Search A', 'Search B', 'Search C']);

      const page = await request(e2e.server).get('/v1/spell-lists?q=name=re=^search&size=2&page=1').set('Authorization', auth).expect(200);
      expect(page.body).toMatchObject({ pagination: { page: 1, size: 2, totalElements: 3, totalPages: 2 } });
      expect(ids(page.body)).toHaveLength(1);

      const none = await request(e2e.server).get('/v1/spell-lists?q=name==Missing').set('Authorization', auth).expect(200);
      expect(ids(none.body)).toEqual([]);
    });

    it('rejects an invalid RSQL expression and an invalid page size', async () => {
      const auth = e2e.auth('owner');
      const res = await request(e2e.server).get('/v1/spell-lists?q=name==').set('Authorization', auth).expect(400);
      expect(res.body).toMatchObject({ error: 'InvalidSearchExpression' });
      await request(e2e.server).get('/v1/spell-lists?size=0').set('Authorization', auth).expect(400);
      await request(e2e.server).get('/v1/spell-lists?page=-1').set('Authorization', auth).expect(400);
    });

    // F-spells-23: the page size has no maximum.
    it('accepts any page size', async () => {
      await request(e2e.server).get('/v1/spell-lists?size=100000').set('Authorization', e2e.auth('owner')).expect(200);
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

    it('does not delete the spells of a deleted list', async () => {
      // F-spells-15: the spells keep pointing to the deleted list.
      const auth = e2e.auth('owner');
      const list = await create('owner');
      const spell = await request(e2e.server).post('/v1/spells').set('Authorization', auth).send(spellBody(list.id)).expect(201);
      await request(e2e.server).delete(`/v1/spell-lists/${list.id}`).set('Authorization', auth).expect(204);
      const found = await request(e2e.server)
        .get(`/v1/spells/${(spell.body as { id: string }).id}`)
        .set('Authorization', auth)
        .expect(200);
      expect(found.body).toMatchObject({ spellListId: list.id });
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
      // F-spells-17: the message is the one of the base list.
      expect(res.body).toMatchObject({ error: 'ValidationError', message: 'Required professionId creating base spell type' });
    });

    it('rejects an unknown access type', async () => {
      await request(e2e.server)
        .post('/v1/spell-lists')
        .set('Authorization', e2e.auth('owner'))
        .send(spellListBody({ accessType: 'shared' }))
        .expect(400);
    });

    // F-spells-12: realm and type only need to be strings.
    it('accepts an unknown realm and type', async () => {
      const list = await create('owner', { realm: 'arcane', type: 'secret' });
      expect(list).toMatchObject({ realm: 'arcane', type: 'secret' });
      const updated = await request(e2e.server)
        .patch(`/v1/spell-lists/${list.id}`)
        .set('Authorization', e2e.auth('owner'))
        .send({ realm: 'void' })
        .expect(200);
      expect(updated.body).toMatchObject({ realm: 'void' });
    });

    it.skip('rejects an unknown realm or type [F-spells-12]', async () => {
      await request(e2e.server)
        .post('/v1/spell-lists')
        .set('Authorization', e2e.auth('owner'))
        .send(spellListBody({ realm: 'arcane' }))
        .expect(400);
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
    // F-spells-16: the name check is global and goes through an RSQL expression built from the name.
    it('rejects a name already used by another user, even in a private list', async () => {
      await create('owner', { name: 'Unique name', accessType: 'private' });
      const res = await request(e2e.server)
        .post('/v1/spell-lists')
        .set('Authorization', e2e.auth('other'))
        .send(spellListBody({ name: 'Unique name' }))
        .expect(409);
      expect(res.body).toMatchObject({ error: 'ConflictError', message: 'Name already in use' });
    });

    it('rejects a name with a double quote as an invalid search', async () => {
      const res = await request(e2e.server)
        .post('/v1/spell-lists')
        .set('Authorization', e2e.auth('owner'))
        .send(spellListBody({ name: 'The "true" fire' }))
        .expect(400);
      expect(res.body).toMatchObject({ error: 'InvalidSearchExpression' });
    });

    it.skip('accepts a name with a double quote [F-spells-16]', async () => {
      await create('owner', { name: 'The "true" fire' });
    });

    it('lets a list be renamed to a name already in use', async () => {
      await create('owner', { name: 'Taken name' });
      const list = await create('owner', { name: 'Free name' });
      await request(e2e.server)
        .patch(`/v1/spell-lists/${list.id}`)
        .set('Authorization', e2e.auth('owner'))
        .send({ name: 'Taken name' })
        .expect(200);
    });
  });

  describe('updates', () => {
    // F-spells-18: an empty string does not clear the description.
    it('keeps the description when it is patched with an empty string', async () => {
      const list = await create('owner', { description: 'Long text' });
      const res = await request(e2e.server)
        .patch(`/v1/spell-lists/${list.id}`)
        .set('Authorization', e2e.auth('owner'))
        .send({ description: '' })
        .expect(200);
      expect(res.body).toMatchObject({ description: 'Long text' });
    });

    it('publishes an updated event for a patch without changes', async () => {
      const list = await create('owner');
      takeTopics(e2e.events);
      await request(e2e.server).patch(`/v1/spell-lists/${list.id}`).set('Authorization', e2e.auth('owner')).send({}).expect(200);
      expect(takeTopics(e2e.events)).toEqual(['internal.rmu-spells.spell-list.updated.v1']);
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

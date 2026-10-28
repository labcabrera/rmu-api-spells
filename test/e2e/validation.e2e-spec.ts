import request from 'supertest';
import { startApp, type E2eApp } from './support/app.js';
import { spellBody, spellListBody, spellModifiers } from './support/fixtures.js';

// Spec 044, fallo 10: the body is validated as sent (no implicit conversion); the query converts page and size itself.
describe('explicit conversion', () => {
  let e2e: E2eApp;
  let listId: string;

  const post = (path: string, body: object) => request(e2e.server).post(path).set('Authorization', e2e.auth('owner')).send(body);
  const get = (path: string) => request(e2e.server).get(path).set('Authorization', e2e.auth('owner'));

  beforeAll(async () => {
    e2e = await startApp();
    const list = await post('/v1/spell-lists', spellListBody()).expect(201);
    listId = (list.body as { id: string }).id;
  });

  afterAll(async () => {
    await e2e?.stop();
  });

  it('rejects a number in a string field', async () => {
    const response = await post('/v1/spell-lists', spellListBody({ name: 42 }));
    expect(response.status).toBe(400);
    expect((response.body as { message: string[] }).message).toContain('name must be a string');
    expect((await post('/v1/spells', spellBody(listId, { name: 42 }))).status).toBe(400);
  });

  it('rejects a string in a boolean field', async () => {
    expect((await post('/v1/spells', spellBody(listId, { modifiers: spellModifiers({ instant: 'true' }) }))).status).toBe(400);
    expect((await post('/v1/spells', spellBody(listId, { modifiers: spellModifiers({ instant: 'false' }) }))).status).toBe(400);
  });

  it('rejects a string in a number field', async () => {
    expect((await post('/v1/spells', spellBody(listId, { level: '3' }))).status).toBe(400);
  });

  it('accepts the spell as typed', async () => {
    expect((await post('/v1/spells', spellBody(listId, { modifiers: spellModifiers({ instant: true }) }))).status).toBe(201);
  });

  it('still converts page and size from the query', async () => {
    for (const path of ['/v1/spell-lists', '/v1/spells']) {
      const response = await get(`${path}?page=0&size=20`);
      expect(response.status).toBe(200);
      expect((response.body as { pagination: unknown }).pagination).toMatchObject({ page: 0, size: 20 });
      expect((await get(`${path}?size=abc`)).status).toBe(400);
    }
  });
});

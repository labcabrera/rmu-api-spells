import { writeFileSync } from 'node:fs';
import request from 'supertest';
import { configureOpenApi } from '../../src/bootstrap/openapi.js';
import { startApp, type E2eApp } from './support/app.js';

type Operation = { security?: unknown[]; responses: Record<string, unknown> };
type Document = { paths: Record<string, Record<string, Operation>>; components: { schemas: Record<string, unknown> } };

// The OpenAPI document describes what the API answers (spec 021, block D).
describe('OpenAPI', () => {
  let e2e: E2eApp;
  let doc: Document;

  beforeAll(async () => {
    e2e = await startApp({}, app => configureOpenApi(app));
    doc = (await request(e2e.server).get('/api-spec').expect(200)).body as Document;
    if (process.env.OPENAPI_DUMP) writeFileSync(process.env.OPENAPI_DUMP, JSON.stringify(doc));
  });

  afterAll(async () => {
    await e2e?.stop();
  });

  it('has no arrays of arrays [F-spells-05]', () => {
    const nested: string[] = [];
    const walk = (node: unknown, at: string) => {
      if (!node || typeof node !== 'object') return;
      const schema = node as { type?: string; items?: { type?: string } };
      if (schema.type === 'array' && schema.items?.type === 'array') nested.push(at);
      for (const [key, value] of Object.entries(node)) walk(value, `${at}.${key}`);
    };
    walk(doc.components.schemas, 'schemas');
    expect(nested).toEqual([]);
  });

  it('documents the health check without security', () => {
    expect(doc.paths['/v1/health'].get.security).toBeUndefined();
    expect(doc.paths['/v1/spells'].get.security).toEqual([{ oauth2: [], 'access-token': [] }]);
  });

  it('documents 201 for the creations and 204 for the deletions', () => {
    for (const path of ['/v1/spells', '/v1/spell-lists']) {
      expect(Object.keys(doc.paths[path].post.responses)).toContain('201');
      expect(Object.keys(doc.paths[path].post.responses)).not.toContain('200');
      expect(Object.keys(doc.paths[`${path}/{id}`].delete.responses)).toContain('204');
    }
  });

  it('documents the owner and the dates in the responses [F-spells-26]', () => {
    for (const name of ['SpellDto', 'SpellListDto']) {
      const schema = doc.components.schemas[name] as { properties: Record<string, { type?: string }> };
      expect(Object.keys(schema.properties)).toEqual(expect.arrayContaining(['owner', 'createdAt', 'updatedAt', 'version']));
    }
    const spell = doc.components.schemas.SpellDto as { properties: Record<string, { type?: string; $ref?: string }> };
    expect(spell.properties.spellListId).toMatchObject({ type: 'string' });
  });
});

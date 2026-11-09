import request from 'supertest';
import { startApp, type E2eApp } from './support/app.js';

// Moved from rmu-api-core (workspace spec 096).
describe('Alchemy tables (e2e)', () => {
  let e2e: E2eApp;

  beforeAll(async () => {
    e2e = await startApp();
  });

  afterAll(async () => {
    await e2e?.stop();
  });

  it('requires Treasure Law access, answers 404 until imported and returns the tables once they are', async () => {
    await request(e2e.server).get('/v1/alchemy-tables').expect(401);
    await request(e2e.server).get('/v1/alchemy-tables').set('Authorization', e2e.auth('owner')).expect(403);
    const missing = await request(e2e.server).get('/v1/alchemy-tables').set('Authorization', e2e.auth('treasureLaw')).expect(404);
    expect(missing.body).toMatchObject({ statusCode: 404, code: 'alchemy-tables-not-found', path: '/v1/alchemy-tables' });

    // Made-up rows and multipliers with the shape of the import, not the rulebook tables.
    const general = [
      { min: 51, max: null, text: 'E2E: open row' },
      { min: 1, max: 50, text: 'E2E: low row', serendipity: 'minor' },
    ];
    const powerLevels = { average: 2, superior: 1.5, heroic: 1, legendary: 0.8, epic: 0.6 };
    await e2e.connection
      .collection('alchemy-tables')
      .insertOne({ _id: 'alchemy', failureTables: { general }, powerLevels, version: 2 } as never);

    const res = await request(e2e.server).get('/v1/alchemy-tables').set('Authorization', e2e.auth('treasureLaw')).expect(200);
    expect(res.body).toMatchObject({ id: 'alchemy', powerLevels, version: 2 });
    const { failureTables } = res.body as { failureTables: Record<string, unknown[]> };
    expect(failureTables.general).toEqual([general[1], general[0]]);
    expect(Object.keys(failureTables)).toHaveLength(10);
    expect(failureTables['spell-power']).toEqual([]);
    await request(e2e.server).get('/v1/alchemy-tables').set('Authorization', e2e.auth('admin')).expect(200);
    await request(e2e.server).get('/v1/alchemy-tables').set('Authorization', e2e.auth('owner')).expect(403);
  });
});

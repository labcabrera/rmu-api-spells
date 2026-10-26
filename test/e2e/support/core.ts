import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

/** Statuses of the fake catalog: a few ids of data/core/effect-types.json. */
export const EFFECT_TYPES = ['stunned', 'prone', 'asleep', 'charmed', 'fear-routed', 'hold', 'bleeding', 'penalty'];

/**
 * rmu-api-core on a free local port, with only GET /v1/effect-types. It answers 401 without a bearer token, as core
 * does, and records the Authorization headers it received. `fail` makes it answer 500.
 */
export class FakeCore {
  private server?: Server;
  readonly authorizations: (string | undefined)[] = [];
  fail = false;
  uri = '';

  async start(): Promise<void> {
    this.server = createServer((req, res) => {
      this.authorizations.push(req.headers.authorization);
      const url = new URL(req.url ?? '/', 'http://core');
      res.setHeader('Content-Type', 'application/json');
      if (url.pathname !== '/v1/effect-types') return void res.writeHead(404).end('{}');
      if (!req.headers.authorization?.startsWith('Bearer ')) return void res.writeHead(401).end('{}');
      if (this.fail) return void res.writeHead(500).end(JSON.stringify({ message: 'core is down' }));
      const content = EFFECT_TYPES.map(id => ({ id }));
      res.end(JSON.stringify({ content, pagination: { page: 0, size: 100, totalElements: content.length, totalPages: 1 } }));
    });
    await new Promise<void>(resolve => this.server!.listen(0, '127.0.0.1', resolve));
    this.uri = `http://127.0.0.1:${(this.server.address() as AddressInfo).port}/v1`;
  }

  async stop(): Promise<void> {
    await new Promise<void>(resolve => (this.server ? this.server.close(() => resolve()) : resolve()));
  }
}

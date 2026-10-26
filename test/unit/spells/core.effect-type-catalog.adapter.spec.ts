import type { ConfigService } from '@nestjs/config';
import { CoreEffectTypeCatalogAdapter } from '../../../src/modules/spells/infrastructure/http/core.effect-type-catalog.adapter.js';
import type { HttpClient } from '../../../src/modules/shared/infrastructure/http/http-client.js';

const config = { get: () => 'http://core/v1' } as unknown as ConfigService;
const page = (ids: string[], totalPages = 1) => ({ content: ids.map(id => ({ id })), pagination: { totalPages } });

describe('CoreEffectTypeCatalogAdapter', () => {
  it('reads every page of core with the token of the request and keeps the ids', async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce(page(['stunned', 'prone'], 2))
      .mockResolvedValueOnce(page(['asleep'], 2));
    const catalog = new CoreEffectTypeCatalogAdapter({ get } as unknown as HttpClient, config);

    expect(await catalog.findUnknown(['stunned', 'asleep', 'flying'], 'Bearer t')).toEqual(['flying']);
    expect(get).toHaveBeenCalledWith('http://core/v1/effect-types?page=1&size=100', { headers: { Authorization: 'Bearer t' } });

    // Known statuses come from the cache; an empty list does not call core.
    get.mockClear();
    expect(await catalog.findUnknown(['prone'], 'Bearer t')).toEqual([]);
    expect(await catalog.findUnknown([], 'Bearer t')).toEqual([]);
    expect(get).not.toHaveBeenCalled();
  });

  it('reads core again before rejecting a status that is not cached', async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce(page(['stunned']))
      .mockResolvedValueOnce(page(['stunned', 'charmed']));
    const catalog = new CoreEffectTypeCatalogAdapter({ get } as unknown as HttpClient, config);
    await catalog.findUnknown(['stunned'], undefined);
    expect(await catalog.findUnknown(['charmed'], undefined)).toEqual([]);
    expect(get).toHaveBeenCalledTimes(2);
  });
});

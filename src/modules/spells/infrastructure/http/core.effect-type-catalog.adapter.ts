import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpClient } from '../../../shared/infrastructure/http/http-client.js';
import type { EffectTypeCatalog } from '../../application/ports/effect-type-catalog.port.js';

type EffectTypePage = { content: { id: string }[]; pagination: { totalPages: number } };

/** How long the ids read from core are kept: the catalog changes rarely. */
const CACHE_TTL_MS = 5 * 60_000;
const PAGE_SIZE = 100;

/**
 * Reads the effect-types catalog of core with the token of the user who saves the spell (core asks only for a valid
 * token), and keeps the ids for a few minutes. A failure of core is a 502, so the spell is not saved unchecked.
 */
@Injectable()
export class CoreEffectTypeCatalogAdapter implements EffectTypeCatalog {
  private readonly baseUri: string;
  private cache: { ids: Set<string>; expiresAt: number } | null = null;

  constructor(
    private readonly http: HttpClient,
    config: ConfigService,
  ) {
    this.baseUri = config.get<string>('RMU_API_CORE_URI')!;
  }

  async findUnknown(statuses: string[], authorization: string | undefined): Promise<string[]> {
    if (statuses.length === 0) return [];
    let ids = this.cachedIds();
    // A status missing from the cache may have been added to core since: read the catalog again before rejecting it.
    if (!ids || statuses.some(status => !ids!.has(status))) ids = await this.load(authorization);
    return [...new Set(statuses)].filter(status => !ids.has(status));
  }

  private cachedIds(): Set<string> | null {
    return this.cache && this.cache.expiresAt > Date.now() ? this.cache.ids : null;
  }

  private async load(authorization: string | undefined): Promise<Set<string>> {
    const headers: Record<string, string> = authorization ? { Authorization: authorization } : {};
    const ids = new Set<string>();
    for (let page = 0, totalPages = 1; page < totalPages; page++) {
      const result = await this.http.get<EffectTypePage>(`${this.baseUri}/effect-types?page=${page}&size=${PAGE_SIZE}`, { headers });
      result.content.forEach(type => ids.add(type.id));
      totalPages = result.pagination.totalPages;
    }
    this.cache = { ids, expiresAt: Date.now() + CACHE_TTL_MS };
    return ids;
  }
}

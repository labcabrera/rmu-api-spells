import { QueryCriteria } from '../criteria/query-criteria.js';
import type { EntitySource } from '../../domain/entities/entity-source.js';

export interface EntityGuard<E> {
  checkCreate(roles: string[]): void;

  checkRead(entity: E, userId: string, roles: string[]): void;

  checkUpdate(entity: E, userId: string, roles: string[]): void;

  checkDelete(entity: E, userId: string, roles: string[]): void;

  /** Spec 063: only an admin asks for `system`; undefined and `user` pass. */
  checkEntitySource(roles: string[], value: EntitySource | undefined): void;

  buildQueryPredicate(userId: string, roles: string[]): QueryCriteria;
}

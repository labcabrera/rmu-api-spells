/** The statuses a spell effect can apply: the ids of the effect-types catalog of core (spec 028, decision 19). */
export interface EffectTypeCatalog {
  /** The statuses that are not in the catalog. `authorization` is the header of the request, forwarded to core. */
  findUnknown(statuses: string[], authorization: string | undefined): Promise<string[]>;
}

export const EFFECT_TYPE_CATALOG = Symbol('EffectTypeCatalog');

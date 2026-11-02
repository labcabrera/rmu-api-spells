export const REALM_TYPES = ['channeling', 'essence', 'mentalism'] as const;

export type RealmType = (typeof REALM_TYPES)[number];

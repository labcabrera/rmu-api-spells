export const LIST_TYPES = ['open', 'closed', 'base'] as const;

export type ListType = (typeof LIST_TYPES)[number];

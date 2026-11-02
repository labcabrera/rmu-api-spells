/** `evil` lists (Spell Law 6.7, 7.7 and 8.7) are a category of their own (spec 028). */
export const LIST_TYPES = ['open', 'closed', 'base', 'evil'] as const;

export type ListType = (typeof LIST_TYPES)[number];

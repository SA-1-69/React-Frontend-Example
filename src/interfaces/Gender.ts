export type GenderId = 1 | 2 | 3

export const GENDERS: ReadonlyArray<{ id: GenderId; label: string }> = [
  { id: 1, label: 'Male' },
  { id: 2, label: 'Female' },
  { id: 3, label: 'Other' },
]

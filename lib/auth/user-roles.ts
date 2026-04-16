/**
 * Spatie role names from `roles`, or legacy single `role` when the array is missing/empty.
 * (`[]` is truthy in JS — do not use `roles || [role]`.)
 */
export function getEffectiveRoleNames(user: {
  roles?: string[]
  role?: string
} | null | undefined): string[] {
  if (!user) return []
  const raw = Array.isArray(user.roles) ? user.roles : []
  if (raw.length > 0) return raw
  return user.role ? [user.role] : []
}

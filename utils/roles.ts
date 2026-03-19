export type UserRole = 'guest' | 'user' | 'moderator' | 'admin' | 'superadmin';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  guest: 0,
  user: 1,
  moderator: 2,
  admin: 3,
  superadmin: 4,
};

export function hasMinRole(userRole: string | undefined | null, requiredRole: UserRole): boolean {
  const effective = (userRole || 'guest') as UserRole;
  return (ROLE_HIERARCHY[effective] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}

// Centralized user identity management
export type AppUser = { 
  id: string; 
  email?: string | null; 
  name?: string | null;
  fullName?: string | null;
};

export type UserDisplayOptions = {
  fallback?: string;
  preferEmail?: boolean;
};

/**
 * Get current authenticated user safely
 * This should be replaced with actual auth integration
 */
export function getCurrentUser(): AppUser | null {
  // TODO[tracked]: Integrate with actual auth system
  // For now, this is a placeholder that should be wired to:
  // - Supabase auth context
  // - Server-side JWT reading
  // - React auth context/hook
  
  // In real implementation:
  // const { data } = await supabase.auth.getUser();
  // return data.user ? mapSupabaseUser(data.user) : null;
  
  return null;
}

/**
 * Get display name for user with fallback options
 */
export function getUserDisplayName(
  user: AppUser | null, 
  options: UserDisplayOptions = {}
): string {
  const { fallback = 'Unknown User', preferEmail = false } = options;
  
  if (!user) return fallback;
  
  if (preferEmail && user.email) return user.email;
  if (user.name) return user.name;
  if (user.fullName) return user.fullName;
  if (user.email) return user.email;
  
  return fallback;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(user: AppUser | null): boolean {
  return user !== null && Boolean(user.id);
}

/**
 * Get user initials for avatar display
 */
export function getUserInitials(user: AppUser | null): string {
  if (!user) return '?';
  
  const name = user.name || user.fullName || user.email;
  if (!name) return '?';
  
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}
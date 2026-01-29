/**
 * Check if pathname matches a string pattern as a path prefix.
 * Ensures proper path boundary checking: '/api' matches '/api' and '/api/users'
 * but NOT '/apiversion' or '/api-docs'.
 *
 * @param pathname - The URL pathname to check
 * @param pattern - The string pattern to match against
 * @returns true if pathname matches the pattern with proper path boundaries
 */
export function matchPathPrefix(pathname: string, pattern: string): boolean {
  if (pathname === pattern) return true;
  // Ensure pattern acts as a complete path segment prefix
  // Add trailing slash if pattern doesn't end with one to enforce boundary
  const prefix = pattern.endsWith('/') ? pattern : `${pattern}/`;
  return pathname.startsWith(prefix);
}

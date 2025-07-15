

// The paths for authentication which are public but have special layout considerations.
const AUTH_PATHS = [
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/reset-password',
];

// Base paths for sections that always require authentication.
const PROTECTED_ROUTE_BASES = [
    '/profile',
    '/settings',
    '/my-content',
    '/connections',
    '/feed',
    '/notifications',
    '/inbox',
];


/**
 * Checks if a given path is an authentication path.
 * These paths are public but use a different layout.
 * @param path The path to check.
 * @returns `true` if the path is an auth path, `false` otherwise.
 */
export const isAuthPath = (path: string) => {
    return AUTH_PATHS.some(p => path.startsWith(p));
};

/**
 * Checks if a given path is a public route that does not require authentication.
 * This is used to determine if an unauthenticated user can view a page.
 * @param path The path to check.
 * @returns `true` if the path is public, `false` otherwise.
 */
export const isPublicPath = (path: string) => {
    // Creation and editing pages are always private.
    if (path.endsWith('/create') || /\/edit$/.test(path)) {
        return false;
    }
    
    // Any route that is explicitly a protected "app" route is NOT public.
    if (PROTECTED_ROUTE_BASES.some(base => path.startsWith(base))) {
        return false;
    }
    
    // Everything else is considered public, including dynamic routes like /u/[username].
    // The specific logic for what to show on those pages is handled by the page components themselves.
    return true;
};

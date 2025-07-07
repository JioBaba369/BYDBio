
// The paths for authentication which are public but have special layout considerations.
const AUTH_PATHS = [
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/reset-password',
];

// The base paths for sections that are strictly private and require authentication.
const PROTECTED_ROUTE_BASES = [
    '/profile',
    '/settings',
    '/calendar', // "My Content" hub
    '/connections',
    '/feed',
    '/notifications',
    '/inbox',
    '/holiday-scheduler',
];

/**
 * Checks if a given path is an authentication path.
 * @param path The path to check.
 * @returns `true` if the path is an auth path, `false` otherwise.
 */
export const isAuthPath = (path: string) => {
    return AUTH_PATHS.some(p => path.startsWith(p));
};

/**
 * Checks if a given path is a public route that does not require authentication.
 * @param path The path to check.
 * @returns `true` if the path is public, `false` otherwise.
 */
export const isPublicPath = (path: string) => {
    // The dashboard is a special case: public for logged-out users (shows landing), private for logged-in.
    // The AuthProvider handles the logged-in case, so we can treat it as public here.
    if (path === '/') {
        return true;
    }
    
    // Auth pages are public.
    if (isAuthPath(path)) {
        return true;
    }
    
    // Any route that is explicitly a protected "app" route is NOT public.
    if (PROTECTED_ROUTE_BASES.some(base => path.startsWith(base))) {
        return false;
    }
    
    // Creation and editing pages are NOT public. This is a more specific check to avoid false positives.
    // e.g. /listings/create, /events/[id]/edit
    if (path.endsWith('/create') || /\/edit$/.test(path)) {
        return false;
    }
    
    // All other paths (content pages, user profiles, etc.) are considered public.
    return true;
};



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
    '/my-content',
    '/diary',
    '/connections',
    '/feed',
    '/notifications',
    '/inbox',
];

// Explicit public paths that aren't dynamic
const EXPLICIT_PUBLIC_PATHS = [
    '/',
    '/explore',
    '/creators',
    '/whats-new',
    '/url-tree',
    '/bydtag',
    '/listings',
    '/job',
    '/events',
    '/offers',
    '/promo'
]

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
    // Auth pages are public.
    if (isAuthPath(path)) {
        return true;
    }

    // Check for explicit public paths.
    if (EXPLICIT_PUBLIC_PATHS.includes(path)) {
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



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
    '/connections',
    '/feed',
    '/notifications',
    '/inbox',
];

// Base paths for public content directories and dynamic content.
const PUBLIC_ROUTE_BASES = [
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
    '/promo',
    '/u', // User profiles
    '/p', // Promo pages
    '/l', // Listings detail
    '/o', // Legacy job pages
    '/support',
    '/trust'
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
    // Creation and editing pages are always private. This is the most specific check.
    // e.g. /listings/create, /events/[id]/edit
    if (path.endsWith('/create') || /\/edit$/.test(path)) {
        return false;
    }
    
    // Auth pages are public.
    if (isAuthPath(path)) {
        return true;
    }
    
    // Any route that is explicitly a protected "app" route is NOT public.
    if (PROTECTED_ROUTE_BASES.some(base => path.startsWith(base))) {
        return false;
    }
    
    // Check if the path starts with any of the defined public base paths.
    // This correctly handles dynamic routes like /u/username, /job/123, etc.
    if (PUBLIC_ROUTE_BASES.some(base => path.startsWith(base))) {
        return true;
    }
    
    // If no other rule matches, default to not public for security.
    return false;
};

    
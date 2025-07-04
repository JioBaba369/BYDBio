
// The paths for authentication which should never have the app layout.
const AUTH_PATHS = [
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/reset-password',
];

// The paths that are public and do not require authentication.
// The app layout (sidebar, header) will be shown for logged-in users on these pages.
const PUBLIC_CONTENT_PATHS = [
    '/u/',
    '/b/',
    '/l/',
    '/o/',
    '/offer/',
    '/events/',
    '/explore',
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
 * Checks if a given path is public (auth or content).
 * The dashboard at '/' is a special case and is always protected.
 * @param path The path to check.
 * @returns `true` if the path is public, `false` otherwise.
 */
export const isPublicPath = (path: string) => {
    if (path === '/') return true;
    return isAuthPath(path) || PUBLIC_CONTENT_PATHS.some(p => path.startsWith(p));
};

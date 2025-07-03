// The paths that are public and do not require authentication.
const PUBLIC_PATHS = [
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/reset-password',
    '/u/',
    '/b/',
    '/l/',
    '/o/',
    '/offer/',
    '/events/'
];

/**
 * Checks if a given path is public.
 * The dashboard at '/' is a special case and is always protected.
 * @param path The path to check.
 * @returns `true` if the path is public, `false` otherwise.
 */
export const isPublicPath = (path: string) => {
    if (path === '/') return false;
    return PUBLIC_PATHS.some(p => path.startsWith(p));
};

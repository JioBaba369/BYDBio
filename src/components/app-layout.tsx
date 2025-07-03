
'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from './auth-provider';
import { MainSidebar } from './main-sidebar';
import { SidebarInset } from './ui/sidebar';

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

const isPublicPath = (path: string) => {
    if (path === '/') return false;
    return PUBLIC_PATHS.some(p => path.startsWith(p));
}

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { loading } = useAuth();
    
    // For auth pages and public-facing content pages, don't render the sidebar
    if (isPublicPath(pathname)) {
        return <>{children}</>;
    }
    
    // For protected app routes, render the sidebar and main content area
    return (
        <>
            <MainSidebar />
            <SidebarInset className="flex-1">
                {!loading && (
                    <main className="p-4 sm:p-6 lg:p-8">
                        {children}
                    </main>
                )}
            </SidebarInset>
        </>
    );
}

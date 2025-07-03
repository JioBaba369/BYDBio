
'use client';

import { usePathname } from 'next/navigation';
import { MainSidebar } from './main-sidebar';
import { SidebarInset } from './ui/sidebar';
import { isPublicPath } from '@/lib/paths';

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    
    // For auth pages and public-facing content pages, don't render the sidebar
    if (isPublicPath(pathname)) {
        return <>{children}</>;
    }
    
    // For protected app routes, render the sidebar and main content area
    return (
        <>
            <MainSidebar />
            <SidebarInset className="flex-1">
                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </SidebarInset>
        </>
    );
}

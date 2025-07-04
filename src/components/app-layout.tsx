
'use client';

import { MainSidebar } from './main-sidebar';
import { SidebarInset, SidebarTrigger } from './ui/sidebar';
import { useAuth } from './auth-provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ChevronDown, LogOut, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';
import { isAuthPath } from '@/lib/paths';
import React, { useState, useEffect } from 'react';
import { DashboardSkeleton } from './dashboard-skeleton';

function Header() {
    const { user } = useAuth();
    const { toast } = useToast();

    const handleLogout = async () => {
        try {
          await signOut(auth);
          toast({
            title: 'Logged Out',
            description: 'You have been successfully logged out.',
          });
          // The AuthProvider will handle the redirect.
        } catch (error) {
           console.error("Logout error:", error);
           toast({
            title: 'Logout Failed',
            description: 'An unexpected error occurred.',
            variant: 'destructive',
          });
        }
    };

    if (!user) return null;

    return (
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
            <div className="md:hidden">
                <SidebarTrigger />
            </div>
            <div className="w-full flex-1">
                {/* We can add a search bar here later if needed */}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="flex items-center gap-2 rounded-full h-9 px-3">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person smiling" />
                    <AvatarFallback>{user.avatarFallback}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">{user.name}</span>
                  <ChevronDown className="h-4 w-4 hidden sm:inline text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const onAuthPage = isAuthPath(pathname);
    const isLandingPage = pathname === '/' && !user && !loading;

    const AppShellSkeleton = () => (
      <>
        <MainSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto relative">
            <DashboardSkeleton />
          </div>
        </SidebarInset>
      </>
    );

    // If we're on the server, or the auth state is still loading,
    // render the full app shell with skeletons. This matches the server render.
    if (!isClient || loading) {
        return <AppShellSkeleton />;
    }

    // Now that we are on the client and auth has loaded, we can safely render based on auth state.
    if (isLandingPage) {
        return <>{children}</>;
    }

    return (
        <>
            <MainSidebar />
            <SidebarInset className="flex flex-col flex-1">
                {!onAuthPage && user && <Header />}
                <div className="p-4 sm:p-6 flex-1 overflow-y-auto relative">
                    {children}
                </div>
            </SidebarInset>
        </>
    );
}

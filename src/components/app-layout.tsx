
'use client';

import { MainSidebar } from './main-sidebar';
import { SidebarInset, SidebarTrigger } from './ui/sidebar';
import { useAuth } from './auth-provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ChevronDown, LogOut, Settings, User, Palette, ArrowLeft, Bell } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { usePathname, useRouter } from 'next/navigation';
import { isAuthPath } from '@/lib/paths';
import React, { useMemo } from 'react';
import { Skeleton } from './ui/skeleton';
import { Logo } from './logo';

function Header() {
    const { user, loading, unreadNotificationCount } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();

    const getPageTitle = React.useCallback((path: string): string => {
        if (path === '/') return 'Dashboard';
        const pathSegments = path.split('/').filter(Boolean);
        const base = pathSegments[0];

        switch (base) {
            case 'feed': return 'Status Feed';
            case 'explore': return 'Explore Content';
            case 'creators': return 'Explore Creators';
            case 'connections': return 'Connections';
            case 'notifications': return 'Notifications';
            case 'inbox': return 'Inbox';
            case 'my-content': return 'My Content';
            case 'diary': return 'My Diary';
            case 'profile': return 'Profile Editor';
            case 'settings': return 'Settings';
            case 'promo': return 'Business Pages';
            case 'listings': return 'Listings';
            case 'job': return 'Job Board';
            case 'events': return 'Events';
            case 'offers': return 'Offers';
            case 'bydtag': return 'BYD BioTAG';
            case 'search': return 'Search Results';
            case 'u': return 'User Profile';
            case 'p': return 'Business Page';
            case 'l': return 'Listing';
            case 'offer': return 'Offer';
            case 'whats-new': return "What's New";
            case 'url-tree': return "URL Tree";
            default: return '';
        }
    }, []);

    const pageTitle = getPageTitle(pathname);
    const pathSegments = pathname.split('/').filter(Boolean);
    
    const showBackButton = useMemo(() => {
        if (pathSegments.length === 0) return false;
        const firstSegment = pathSegments[0];
        if (firstSegment === 'u') {
            return pathSegments.length > 2;
        }
        return pathSegments.length > 1;
    }, [pathSegments]);

    const handleLogout = async () => {
        try {
          await signOut(auth);
          toast({
            title: 'Logged Out',
            description: 'You have been successfully logged out.',
          });
          router.push('/');
        } catch (error) {
           console.error("Logout error:", error);
           toast({
            title: 'Logout Failed',
            description: 'An unexpected error occurred.',
            variant: 'destructive',
          });
        }
    };
    
    if (loading) {
        return (
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
                 <div className="md:hidden">
                    <Skeleton className="h-7 w-7" />
                </div>
                <div className="flex-1">
                    <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-9 w-32 rounded-full" />
            </header>
        )
    }

    if (!user) {
        return (
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
                <Logo />
                <div className="flex-1" />
                <Button asChild variant="ghost">
                    <Link href="/auth/sign-in">Sign In</Link>
                </Button>
                <Button asChild>
                    <Link href="/auth/sign-up">Get Started</Link>
                </Button>
            </header>
        )
    }

    return (
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
            <div className="md:hidden">
                <SidebarTrigger />
            </div>
            
            <div className="flex-1 flex items-center gap-2">
                {showBackButton && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Back</span>
                    </Button>
                )}
                <h1 className="text-lg font-semibold truncate">{pageTitle}</h1>
            </div>

            <Button asChild variant="ghost" size="icon" className="relative">
              <Link href="/notifications">
                <Bell className="h-5 w-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
                <span className="sr-only">View Notifications</span>
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="flex items-center gap-2 rounded-full h-9 px-3">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
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
                  <DropdownMenuItem asChild>
                    <Link href="/settings?tab=appearance" className="cursor-pointer">
                      <Palette className="mr-2 h-4 w-4" />
                      <span>Appearance</span>
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
    const pathname = usePathname();
    const onAuthPage = isAuthPath(pathname);
    const { user, loading } = useAuth();

    return (
        <>
            {user && !loading && <MainSidebar />}
            <SidebarInset className="flex flex-col flex-1">
                {!onAuthPage && <Header />}
                <main className="p-4 sm:p-6 flex-1 overflow-y-auto relative animate-fade-in">
                    {children}
                </main>
            </SidebarInset>
        </>
    );
}

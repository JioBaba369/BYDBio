
'use client';

import { MainSidebar } from './main-sidebar';
import { SidebarInset, SidebarTrigger } from './ui/sidebar';
import { useAuth } from './auth-provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { LogOut, Settings, User, Palette, Bell, Search } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { usePathname, useRouter } from 'next/navigation';
import { isAuthPath } from '@/lib/paths';
import React from 'react';
import { Skeleton } from './ui/skeleton';
import { Logo } from './logo';

function Header() {
    const { user, loading, unreadNotificationCount } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

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
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="flex-1" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
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
            
            <div className="flex-1" />

            <Button asChild variant="ghost" size="icon">
              <Link href="/search">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Link>
            </Button>
            
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
                <button className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.avatarFallback}</AvatarFallback>
                  </Avatar>
                </button>
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

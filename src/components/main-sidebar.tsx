
'use client';

import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Logo } from './logo';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Briefcase,
  Calendar,
  ChevronDown,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Share,
  User,
  Search,
  Users,
  Tags,
  CalendarDays,
  Building2,
  Bell,
  BookUser,
  BookText,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from './ui/input';
import { currentUser } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

export function MainSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const { toast } = useToast();

  const isActive = (path: string) => {
    // Exact match for dashboard and the main bio page
    if (path === '/' || path === `/u/${currentUser.username}`) {
      return pathname === path;
    }
     // Handle special case for /u/[username]/card and /u/[username]/links
    if (path.includes(`/u/${currentUser.username}/`)) {
        return pathname === path;
    }
    // Prefix match for all other pages
    return pathname.startsWith(path) && path !== '/';
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${searchQuery.trim()}`);
    }
  };

  const handleLogout = () => {
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    // In a real app, you would also redirect or clear auth state.
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Logo className="text-sidebar-foreground" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Dashboard" isActive={isActive('/')}>
              <Link href="/">
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Status Feed" isActive={isActive('/feed')}>
              <Link href="/feed">
                <MessageSquare />
                <span>Status Feed</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Connections" isActive={isActive('/connections')}>
              <Link href="/connections">
                <Users />
                <span>Connections</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Notifications" isActive={isActive('/notifications')}>
              <Link href="/notifications">
                <Bell />
                <span>Notifications</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        
          <SidebarMenuItem>
            <SidebarSeparator className="my-1" />
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarGroupLabel>Content</SidebarGroupLabel>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Profile Editor" isActive={isActive('/profile')}>
              <Link href="/profile">
                <User />
                <span>Profile Editor</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Content Calendar" isActive={isActive('/calendar')}>
              <Link href="/calendar">
                <CalendarDays />
                <span>Content Calendar</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Diary" isActive={isActive('/diary')}>
              <Link href="/diary">
                <BookText />
                <span>Diary</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="My Businesses" isActive={isActive('/businesses')}>
              <Link href="/businesses">
                <Building2 />
                <span>My Businesses</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Listings" isActive={isActive('/listings')}>
              <Link href="/listings">
                <Tags />
                <span>Listings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Opportunities" isActive={isActive('/opportunities')}>
              <Link href="/opportunities">
                <Briefcase />
                <span>Opportunities</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Events" isActive={isActive('/events')}>
              <Link href="/events">
                <Calendar />
                <span>Events</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Offers" isActive={isActive('/offers')}>
              <Link href="/offers">
                <DollarSign />
                <span>Offers</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarSeparator className="my-1" />
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarGroupLabel>Public Pages</SidebarGroupLabel>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Bio Page" isActive={isActive(`/u/${currentUser.username}`)}>
              <Link href={`/u/${currentUser.username}`}>
                <Share />
                <span>Bio Page</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Digital Business Card" isActive={isActive(`/u/${currentUser.username}/card`)}>
              <Link href={`/u/${currentUser.username}/card`}>
                <CreditCard />
                <span>Digital Business Card</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Links Page" isActive={isActive(`/u/${currentUser.username}/links`)}>
              <Link href={`/u/${currentUser.username}/links`}>
                <BookUser />
                <span>Links Page</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm text-sidebar-foreground hover:bg-sidebar-accent">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint="woman smiling" />
                <AvatarFallback>{currentUser.avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="flex-1 truncate">
                <div className="font-medium">{currentUser.name}</div>
                <div className="text-xs text-sidebar-foreground/70">
                  {currentUser.email}
                </div>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {currentUser.email}
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
      </SidebarFooter>
    </Sidebar>
  );
}

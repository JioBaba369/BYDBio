

'use client';

import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarFooter,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Logo } from './logo';
import {
  Settings,
  User,
  Search,
  Users,
  Bell,
  Compass,
  Megaphone,
  UserCircle,
  Building2,
  Share2,
  LayoutDashboard,
  Rss,
  Mail,
  Briefcase,
  Tags,
  Gift,
  Calendar,
  Nfc,
  Link as LinkIcon,
  BookUser,
  Paintbrush,
  BadgeHelp,
  Shield,
  Package,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from './ui/input';
import { useAuth } from './auth-provider';
import { Skeleton } from './ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export function MainSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const { user, loading, unreadNotificationCount } = useAuth();
  
  const isActive = (path: string, exact: boolean = false) => {
    if (exact) return pathname === path;
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${searchQuery.trim()}`);
    }
  };
  
  const isAdmin = user?.email === 'admin@byd.bio';

  if (loading) {
     return (
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent className="p-2 space-y-2">
          <div className='p-2'><Skeleton className="h-8 w-full" /></div>
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </SidebarGroup>
           <SidebarGroup>
            <SidebarGroupLabel>Content</SidebarGroupLabel>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </SidebarGroup>
        </SidebarContent>
         <SidebarFooter>
            <div className="flex w-full items-center gap-2 rounded-md p-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
         </SidebarFooter>
      </Sidebar>
    );
  }
  
  if (!user) {
    return null;
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Community</SidebarGroupLabel>
          <SidebarMenu>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Explore" isActive={isActive('/explore')}>
                <Link href="/explore">
                  <Compass />
                  <span>Explore</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Creators" isActive={isActive('/creators')}>
                <Link href="/creators">
                  <Users />
                  <span>Creators</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Business Pages" isActive={isActive('/promo') && !pathname.includes('/create')}>
                <Link href="/promo">
                  <Megaphone />
                  <span>Business Pages</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Listings" isActive={isActive('/listings') && !pathname.includes('/create')}>
                <Link href="/listings">
                  <Tags />
                  <span>Listings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Jobs" isActive={isActive('/job') && !pathname.includes('/create')}>
                <Link href="/job">
                  <Briefcase />
                  <span>Jobs</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Events" isActive={isActive('/events') && !pathname.includes('/create')}>
                <Link href="/events">
                  <Calendar />
                  <span>Events</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Offers" isActive={isActive('/offers') && !pathname.includes('/create')}>
                <Link href="/offers">
                  <Gift />
                  <span>Offers</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>My Hub</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard" isActive={isActive('/', true)}>
                <Link href="/">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Status Feed" isActive={isActive('/feed')}>
                <Link href="/feed">
                  <Rss />
                  <span>Status Feed</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="My Content" isActive={isActive('/my-content')}>
                <Link href="/my-content">
                  <Paintbrush />
                  <span>My Content</span>
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
                   {unreadNotificationCount > 0 && (
                    <SidebarMenuBadge>{unreadNotificationCount}</SidebarMenuBadge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Inbox" isActive={isActive('/inbox')}>
                <Link href="/inbox">
                  <Mail />
                  <span>Inbox</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
            <SidebarGroupLabel>Manage Profile</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Profile Editor" isActive={isActive('/profile')}>
                  <Link href="/profile">
                    <User />
                    <span>Profile Editor</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="BYD BioTAG" isActive={isActive('/bydtag')}>
                  <Link href="/bydtag">
                    <Nfc />
                    <span>BYD BioTAG</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarSeparator/>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Public Bio Page" isActive={isActive(`/u/${user.username}`) && !pathname.includes('/card') && !pathname.includes('/links')}>
                  <Link href={`/u/${user.username}`}>
                    <UserCircle />
                    <span>Public Bio Page</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Digital Business Card" isActive={isActive(`/u/${user.username}/card`)}>
                  <Link href={`/u/${user.username}/card`}>
                    <Building2 />
                    <span>Digital Card</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Links Page" isActive={isActive(`/u/${user.username}/links`)}>
                  <Link href={`/u/${user.username}/links`}>
                    <LinkIcon />
                    <span>Links Page</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
        
        {isAdmin && (
            <SidebarGroup>
                <SidebarGroupLabel>Admin</SidebarGroupLabel>
                <SidebarMenu>
                    <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Orders" isActive={isActive('/admin/orders')}>
                        <Link href="/admin/orders">
                        <Package />
                        <span>Orders</span>
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
         <SidebarSeparator />
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings" isActive={isActive('/settings')}>
                <Link href="/settings">
                    <Settings />
                    <span>Settings</span>
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
         <SidebarSeparator />
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="My Profile & Settings" size="lg" className="h-auto p-2" isActive={isActive('/settings')}>
                    <Link href="/settings">
                        <span className="flex w-full items-center gap-2 text-left">
                            <Avatar className="size-8">
                                <AvatarImage src={user.avatarUrl} />
                                <AvatarFallback>{user.avatarFallback}</AvatarFallback>
                            </Avatar>
                            <span className="min-w-0 flex-1">
                                <p className="truncate font-semibold">{user.name}</p>
                                <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
                            </span>
                        </span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

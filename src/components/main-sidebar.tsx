
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
  sidebarMenuButtonVariants,
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
import { cn } from '@/lib/utils';

export function MainSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const { toast } = useToast();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path;
    }
    // For the public page, we want an exact match, not a prefix match
    if (path.startsWith('/u/')) {
        return pathname === path;
    }
    return pathname.startsWith(path);
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
        <Logo />
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
            <Link href="/" className={cn(sidebarMenuButtonVariants())} data-active={isActive('/')}>
              <LayoutDashboard />
              Dashboard
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/feed" className={cn(sidebarMenuButtonVariants())} data-active={isActive('/feed')}>
              <MessageSquare />
              Status Feed
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/connections" className={cn(sidebarMenuButtonVariants())} data-active={isActive('/connections')}>
              <Users />
              Connections
            </Link>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <Link href="/notifications" className={cn(sidebarMenuButtonVariants())} data-active={isActive('/notifications')}>
              <Bell />
              Notifications
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/profile" className={cn(sidebarMenuButtonVariants())} data-active={isActive('/profile')}>
              <User />
              Profile Editor
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/calendar" className={cn(sidebarMenuButtonVariants())} data-active={isActive('/calendar')}>
              <CalendarDays />
              Content Calendar
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/businesses" className={cn(sidebarMenuButtonVariants())} data-active={isActive('/businesses')}>
              <Building2 />
              My Businesses
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/listings" className={cn(sidebarMenuButtonVariants())} data-active={isActive('/listings')}>
              <Tags />
              Listings
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/opportunities" className={cn(sidebarMenuButtonVariants())} data-active={isActive('/opportunities')}>
              <Briefcase />
              Opportunities
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/events" className={cn(sidebarMenuButtonVariants())} data-active={isActive('/events')}>
              <Calendar />
              Events
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/offers" className={cn(sidebarMenuButtonVariants())} data-active={isActive('/offers')}>
              <DollarSign />
              Offers
            </Link>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <Link href={`/u/${currentUser.username}`} className={cn(sidebarMenuButtonVariants())} data-active={isActive(`/u/${currentUser.username}`)}>
              <Share />
              Public Page
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href={`/u/${currentUser.username}/card`} className={cn(sidebarMenuButtonVariants())} data-active={isActive(`/u/${currentUser.username}/card`)}>
              <CreditCard />
              Digital Business Card
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href={`/u/${currentUser.username}/bio`} className={cn(sidebarMenuButtonVariants())} data-active={isActive(`/u/${currentUser.username}/bio`)}>
              <BookUser />
              Bio Card
            </Link>
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

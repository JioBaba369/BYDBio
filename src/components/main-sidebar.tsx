
'use client';

import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
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
  MessageSquare,
  Share,
  User,
  Search,
  Users,
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

export function MainSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  const isActive = (path: string) => {
    if (path === '/') {
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
            <Link href="/">
              <SidebarMenuButton
                isActive={isActive('/')}
                icon={<LayoutDashboard />}
              >
                Dashboard
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/profile">
              <SidebarMenuButton
                isActive={isActive('/profile')}
                icon={<User />}
              >
                Profile Editor
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/feed">
              <SidebarMenuButton
                isActive={isActive('/feed')}
                icon={<MessageSquare />}
              >
                Status Feed
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/connections">
              <SidebarMenuButton
                isActive={isActive('/connections')}
                icon={<Users />}
              >
                Connections
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/opportunities">
              <SidebarMenuButton
                isActive={isActive('/opportunities')}
                icon={<Briefcase />}
              >
                Jobs
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/events">
              <SidebarMenuButton
                isActive={isActive('/events')}
                icon={<Calendar />}
              >
                Events
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/offers">
              <SidebarMenuButton
                isActive={isActive('/offers')}
                icon={<DollarSign />}
              >
                Offers
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <Link href="/u/janedoe">
              <SidebarMenuButton
                isActive={isActive('/u/janedoe')}
                icon={<Share />}
              >
                Public Page
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/u/janedoe/card">
              <SidebarMenuButton
                isActive={isActive('/u/janedoe/card')}
                icon={<CreditCard />}
              >
                Digital Business Card
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm text-sidebar-foreground hover:bg-sidebar-accent">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/100x100.png" alt="Jane Doe" data-ai-hint="woman smiling" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1 truncate">
                <div className="font-medium">Jane Doe</div>
                <div className="text-xs text-sidebar-foreground/70">
                  jane.doe@example.com
                </div>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Jane Doe</p>
                <p className="text-xs leading-none text-muted-foreground">
                  jane.doe@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

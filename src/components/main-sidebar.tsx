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
} from '@/components/ui/sidebar';
import { Logo } from './logo';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Briefcase,
  Calendar,
  ChevronDown,
  DollarSign,
  LayoutDashboard,
  MessageSquare,
  Share,
  User,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function MainSidebar() {
  const pathname = usePathname();
  const [hash, setHash] = React.useState('');

  React.useEffect(() => {
    const onHashChange = () => {
      setHash(window.location.hash);
    };
    onHashChange(); // Set initial hash
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  const isActive = (path: string, linkHash?: string) => {
    if (path === '/opportunities' && linkHash) {
      return pathname === path && (hash || '#jobs') === linkHash;
    }
    return pathname === path;
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
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
            <Link href="/opportunities#jobs">
              <SidebarMenuButton
                isActive={isActive('/opportunities', '#jobs')}
                icon={<Briefcase />}
              >
                Jobs
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/opportunities#events">
              <SidebarMenuButton
                isActive={isActive('/opportunities', '#events')}
                icon={<Calendar />}
              >
                Events
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/opportunities#offers">
              <SidebarMenuButton
                isActive={isActive('/opportunities', '#offers')}
                icon={<DollarSign />}
              >
                Offers
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <Link href="/u/janedoe">
              <SidebarMenuButton
                icon={<Share />}
              >
                Public Page
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

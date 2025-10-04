
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  UsersRound,
  Brain,
  Trophy,
  BookOpen,
  LogOut,
  Sparkles,
  ShoppingBasket,
  Stethoscope,
  ClipboardList,
  CalendarDays,
  FileDown,
  Info,
  Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/digital-twin/create', label: 'Build Your Twin', icon: UsersRound },
  { href: '/symptom-tracker', label: 'Symptom Tracker', icon: ClipboardList },
  { href: '/period-tracker', label: 'Period Tracker', icon: CalendarDays }, 
  { href: '/get-suggestion', label: 'Holistic Suggestions', icon: Brain },
  { href: '/lifestyle-goals', label: 'Lifestyle & Goals', icon: Trophy },
  { href: '/remedy-hub', label: 'Remedy Hub', icon: BookOpen },
  { href: '/chatbot', label: 'Chat with Mitra', icon: Bot },
  { href: '/products', label: 'Products', icon: ShoppingBasket },
  { href: '/consult-doctor', label: 'Consult a Doctor', icon: Stethoscope },
  { href: '/health-report', label: 'Health Report', icon: FileDown },
  { href: '/awareness', label: 'PCOS Awareness', icon: Info },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r">
      <SidebarHeader className="p-4 flex items-center gap-2">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-headline font-semibold text-sidebar-primary">
          <Sparkles className="h-7 w-7 text-primary" />
          <span className="group-data-[collapsible=icon]:hidden">Mitra PCOS</span>
        </Link>
        <SidebarTrigger className="ml-auto md:hidden" />
      </SidebarHeader>
      <Separator />
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                tooltip={{ children: item.label, side: 'right', align: 'center' }}
                className={cn(
                  "justify-start",
                  (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) && "bg-primary/20 text-primary hover:bg-primary/30"
                )}
              >
                <Link href={item.href}>
                  <span style={{ display: 'contents' }}>
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <Separator />
      <SidebarFooter className="p-4">
        <Button variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center" onClick={() => alert('Log out functionality would be implemented here.')}>
          <LogOut className="h-5 w-5" />
          <span className="group-data-[collapsible=icon]:hidden">Log Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

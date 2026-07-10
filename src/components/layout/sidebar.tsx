"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const iconMap: Record<string, React.ComponentType<any>> = {
  Users,
  UserCog,
  Settings,
  Zap,
};

interface NavItem {
  label: string;
  href: string;
  icon: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Leads", href: "/dashboard/leads", icon: "Users" },
  { label: "Clients", href: "/dashboard/clients", icon: "UserCog", adminOnly: true },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  role: string;
  isMobile?: boolean;
}

export function Sidebar({ collapsed, onToggle, role, isMobile }: SidebarProps) {
  const pathname = usePathname();

  const filteredItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly && role !== "SUPER_ADMIN") return false;
    return true;
  });

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-0 bottom-0 z-30 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isMobile ? "w-[260px]" : collapsed ? "w-[70px]" : "w-[260px]",
        !isMobile && "hidden lg:flex"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-sidebar-border",
        collapsed && !isMobile ? "justify-center" : "gap-3"
      )}>
        <div className="flex-shrink-0 w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-primary/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {(!collapsed || isMobile) && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-bold text-lg tracking-tight whitespace-nowrap"
          >
            Lead<span className="text-primary">IQ</span>
          </motion.span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = iconMap[item.icon] || Users;
          const active = isActive(item.href);

          const linkContent = (
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                collapsed && !isMobile && "justify-center px-2"
              )}
            >
              {active && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                />
              )}
              <Icon className={cn("w-5 h-5 flex-shrink-0", active && "text-primary")} />
              {(!collapsed || isMobile) && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );

          if (collapsed && !isMobile) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <React.Fragment key={item.href}>{linkContent}</React.Fragment>;
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-2">
        {/* Sign Out */}
        {collapsed && !isMobile ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center justify-center w-full px-2 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Sign Out</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        )}

        {/* Collapse Toggle (desktop only) */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-full justify-center"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}

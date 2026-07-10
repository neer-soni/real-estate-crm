"use client";

import React from "react";
import { Menu, Moon, Sun, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { Badge } from "@/components/ui/badge";

interface TopbarProps {
  onMenuClick: () => void;
  user: any;
}

export function Topbar({ onMenuClick, user }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border bg-background flex items-center justify-between px-4 lg:px-6">
      {/* Left: Mobile menu + breadcrumb */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="hidden sm:block">
          <h2 className="text-sm font-semibold text-foreground">Dashboard</h2>
          <p className="text-xs text-muted-foreground">
            {user?.role === "SUPER_ADMIN" ? "Super Admin" : "Client"} Panel
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="transition-transform hover:rotate-12"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex items-center gap-2">
                <span>{user?.name}</span>
                <Badge variant={user?.role === "SUPER_ADMIN" ? "default" : "secondary"} className="text-[10px]">
                  {user?.role === "SUPER_ADMIN" ? "Admin" : "Client"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-normal mt-0.5">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })} className="text-destructive focus:text-destructive cursor-pointer">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

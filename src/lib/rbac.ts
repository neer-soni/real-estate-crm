import { Role } from "@prisma/client";

export type Permission =
  | "properties.view"
  | "properties.create"
  | "properties.edit"
  | "properties.delete"
  | "properties.disable"
  | "properties.feature"
  | "properties.markSold"
  | "leads.view"
  | "leads.create"
  | "leads.edit"
  | "leads.delete"
  | "leads.assign"
  | "leads.export"
  | "leads.search"
  | "clients.view"
  | "clients.create"
  | "clients.edit"
  | "clients.delete"
  | "analytics.view"
  | "users.manage"
  | "upload.images"
  | "data.export";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "properties.view",
    "properties.create",
    "properties.edit",
    "properties.delete",
    "properties.disable",
    "properties.feature",
    "properties.markSold",
    "leads.view",
    "leads.create",
    "leads.edit",
    "leads.delete",
    "leads.assign",
    "leads.export",
    "leads.search",
    "clients.view",
    "clients.create",
    "clients.edit",
    "clients.delete",
    "analytics.view",
    "users.manage",
    "upload.images",
    "data.export",
  ],
  CLIENT: [
    "properties.view",
    "properties.create",
    "leads.view",
    "leads.edit",
    "leads.search",
    "leads.export",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function isAdmin(role: Role): boolean {
  return role === "SUPER_ADMIN";
}

// Navigation items based on role
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  permission?: Permission;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Analytics",
    href: "/dashboard",
    icon: "BarChart3",
    adminOnly: true,
  },
  {
    label: "Properties",
    href: "/dashboard/properties",
    icon: "Building2",
    permission: "properties.view",
  },
  {
    label: "Leads",
    href: "/dashboard/leads",
    icon: "Users",
  },
  {
    label: "Clients",
    href: "/dashboard/clients",
    icon: "UserCog",
    adminOnly: true,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: "Settings",
  },
];

export function getNavItems(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => {
    if (item.adminOnly && role !== "SUPER_ADMIN") return false;
    if (item.permission && !hasPermission(role, item.permission)) return false;
    return true;
  });
}

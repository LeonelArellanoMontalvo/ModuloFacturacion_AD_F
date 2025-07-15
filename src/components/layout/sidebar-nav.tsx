"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, FileText, Tag, Package, ShieldQuestion } from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";

const allNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home, subModulo: 'Dashboard' },
  { href: "/tipo-clientes", label: "Tipos de Cliente", icon: Tag, subModulo: 'Tipo de Clientes' },
  { href: "/clientes", label: "Clientes", icon: Users, subModulo: 'Clientes' },
  { href: "/facturas", label: "Facturas", icon: FileText, subModulo: 'Facturas' },
  { href: "/productos", label: "Productos", icon: Package, subModulo: 'Productos' },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { hasPermission } = useAuth();
  
  // The first item is always the Dashboard, which should always be visible.
  const navItems = [
    allNavItems[0], 
    ...allNavItems.slice(1).filter(item => hasPermission(item.subModulo, 'R'))
  ];

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            isActive={pathname === item.href}
            tooltip={item.label}
            asChild
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

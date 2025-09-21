import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  FileText,
  Building2,
  Users,
  HeartHandshake,
  Lightbulb,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth, hasPermission } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: BarChart3,
    permission: 'dashboard',
    roles: ['admin', 'ccc', 'camara_aliada'],
  },
  {
    title: 'Insights',
    href: '/insights',
    icon: Lightbulb,
    permission: 'insights_read',
    roles: ['admin', 'ccc', 'camara_aliada'],
  },
  {
    title: 'Solicitudes',
    href: '/solicitudes',
    icon: FileText,
    permission: 'solicitudes',
    roles: ['admin', 'ccc', 'camara_aliada'],
  },
  {
    title: 'Empresas',
    href: '/empresas',
    icon: Building2,
    permission: 'empresas',
    roles: ['admin', 'ccc', 'camara_aliada'],
  },
  {
    title: 'Colaboradores',
    href: '/colaboradores',
    icon: Users,
    permission: 'colaboradores',
    roles: ['admin', 'ccc', 'camara_aliada'],
  },
  {
    title: 'CRM Cámaras',
    href: '/crm',
    icon: HeartHandshake,
    permission: 'crm',
    roles: ['admin', 'ccc'],
  },
  {
    title: 'Ajustes',
    href: '/ajustes',
    icon: Settings,
    permission: 'ajustes',
    roles: ['admin'],
  },
];

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <aside className={cn(
      "relative flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar hover:bg-sidebar-accent z-10"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 pt-8">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/' && location.pathname.startsWith(item.href));
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className={cn("h-5 w-5", collapsed && "h-4 w-4")} />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User chamber info */}
      {!collapsed && user.chamber && (
        <div className="border-t border-sidebar-border p-4">
          <div className="text-xs text-sidebar-foreground/70 mb-1">Tu Cámara</div>
          <div className="text-sm font-medium text-sidebar-foreground line-clamp-2">
            {user.chamber}
          </div>
        </div>
      )}
    </aside>
  );
}
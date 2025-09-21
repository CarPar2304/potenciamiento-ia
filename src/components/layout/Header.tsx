import { Search, Moon, Sun, User, LogOut, Settings } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logoLight from '@/assets/logo-light.png';
import logoDark from '@/assets/logo-dark.png';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { profile, signOut } = useAuth();

  if (!profile) return null;

  const getRoleDisplayName = (role: string) => {
    const roles = {
      admin: 'Administrador',
      ccc: 'CCC',
      camara_aliada: 'Cámara Aliada',
    };
    return roles[role as keyof typeof roles] || role;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <img 
            src={theme === 'dark' ? logoLight : logoDark} 
            alt="CCC Logo" 
            className="h-10 w-auto"
          />
          <div className="hidden md:block">
            <h2 className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
              Potenciamiento IA
            </h2>
            <p className="text-xs text-muted-foreground">CCC y Cámaras Aliadas</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-lg mx-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar solicitudes, empresas..."
              className="pl-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Role indicator */}
          <div className="hidden md:flex items-center text-sm text-muted-foreground">
            <span className="font-medium">{getRoleDisplayName(profile.role)}</span>
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(profile.nombre)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{profile.nombre}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {profile.email}
                  </p>
                  {profile.chamber && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {profile.chamber}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
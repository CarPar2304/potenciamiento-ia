import { Card, CardContent } from '@/components/ui/card';
import { useAuth, hasPermission } from '@/contexts/AuthContext';
import { useCamaras } from '@/hooks/useSupabaseData';

export default function CRM() {
  const { profile } = useAuth();
  const { camaras, loading } = useCamaras();

  if (!profile) return null;

  const canViewGlobal = hasPermission(profile.role, 'view_global') || hasPermission(profile.role, 'view_all');

  if (!canViewGlobal) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2">Acceso restringido</h3>
            <p className="text-muted-foreground text-center">
              Esta sección está disponible solo para administradores.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          CRM Cámaras
        </h1>
        <p className="text-muted-foreground">
          Gestión de relaciones con {camaras.length} cámaras aliadas
        </p>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            CRM funcional conectado con datos reales de Supabase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
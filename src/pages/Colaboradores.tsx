import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSolicitudes, usePlatziGeneral } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';

export default function Colaboradores() {
  const { profile } = useAuth();
  const { solicitudes, loading } = useSolicitudes();
  const { platziData } = usePlatziGeneral();

  if (!profile) return null;

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Colaboradores
          </h1>
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Colaboradores
        </h1>
        <p className="text-muted-foreground">
          Vista de colaboradores - {solicitudes.length} registrados
        </p>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Vista de colaboradores conectada con datos reales de Supabase.
            Total de solicitudes: {solicitudes.length}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
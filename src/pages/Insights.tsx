import { Card, CardContent } from '@/components/ui/card';

export default function Insights() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Insights & Tendencias
        </h1>
        <p className="text-muted-foreground">
          Análisis, tendencias y casos de éxito en adopción de IA
        </p>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Sección de insights funcional, lista para contenido real.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
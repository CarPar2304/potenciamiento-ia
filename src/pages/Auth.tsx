import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import logoDark from '@/assets/logo-dark.png';
import logoLight from '@/assets/logo-light.png';

export default function Auth() {
  console.log('Auth component loaded - login only version');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, user, profile, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Manejar redirección solo cuando el auth esté completamente cargado
  useEffect(() => {
    if (!authLoading && user && profile) {
      navigate('/', { replace: true });
    }
  }, [authLoading, user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(getErrorMessage(error.message));
      } else {
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente.",
        });
        navigate('/');
      }
    } catch (error: any) {
      setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorMessage: string) => {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Credenciales incorrectas. Verifica tu email y contraseña.',
      'User already registered': 'Este email ya está registrado. Intenta iniciar sesión.',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
      'Invalid email': 'El email ingresado no es válido.',
      'Email not confirmed': 'Por favor confirma tu email antes de iniciar sesión.',
      'Too many requests': 'Demasiados intentos. Espera unos minutos antes de intentar de nuevo.',
    };

    return errorMap[errorMessage] || 'Error de autenticación. Inténtalo de nuevo.';
  };

  const currentLogo = theme === 'dark' ? logoDark : logoLight;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src={currentLogo} 
            alt="Logo" 
            className="h-16 mx-auto mb-4 transition-all duration-300"
          />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Potenciamiento IA
          </h1>
          <p className="text-muted-foreground mt-2">
            Sistema de Gestión de Licencias Platzi
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-card/95 border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nombre@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-colors focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10 transition-colors focus:border-primary"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground transition-all duration-200"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Iniciar Sesión
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center mt-6 text-xs text-muted-foreground">
          <p>© 2024 Cámara de Comercio de Cali. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}
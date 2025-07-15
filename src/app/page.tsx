
"use client"
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Lock, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
    const { setDirectAccess } = useAuth();
    const router = useRouter();

    const handleDirectAccess = () => {
        setDirectAccess();
        router.push('/dashboard');
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold font-headline text-4xl">
                    A
                </div>
            </div>
          <CardTitle className="text-3xl font-bold font-headline">Bienvenido a APDIS Manager</CardTitle>
          <CardDescription>Seleccione un método de acceso para continuar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button className="w-full" size="lg" asChild>
                <Link href="/auth/login">
                <Lock className="mr-2 h-5 w-5" />
                Ingresar con Usuario
                </Link>
            </Button>
          <Button className="w-full" variant="secondary" size="lg" onClick={handleDirectAccess}>
            <LogIn className="mr-2 h-5 w-5" />
            Acceso Directo (Sin Restricciones)
          </Button>
        </CardContent>
         <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            El acceso directo es para fines de desarrollo y no aplicará reglas de seguridad.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

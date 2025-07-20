
"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, FileText, Tag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

interface Stats {
    tiposCount: number;
    clientesCount: number;
    facturasCount: number;
}

async function getStats(): Promise<Stats> {
    try {
        const [tipos, clientes, facturas] = await Promise.all([
            fetch('https://apdis-p5v5.vercel.app/api/tipo_clientes/', { cache: 'no-store' }).then(res => res.json()),
            fetch('https://apdis-p5v5.vercel.app/api/clientes/', { cache: 'no-store' }).then(res => res.json()),
            fetch('https://apdis-p5v5.vercel.app/api/facturas/', { cache: 'no-store' }).then(res => res.json()),
        ]);

        return {
            tiposCount: tipos.length,
            clientesCount: clientes.length,
            facturasCount: facturas.length
        };
    } catch (error) {
        console.error("Failed to fetch stats:", error);
        return {
            tiposCount: 0,
            clientesCount: 0,
            facturasCount: 0
        };
    }
}


export default function DashboardPage() {
    const { user, isDirectAccess } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        getStats().then(setStats);
    }, []);

    return (
      <div>
        <PageHeader title="Bienvenido a APDIS Manager" />
        <p className="mb-6 text-muted-foreground">
          Aquí tiene un resumen de su negocio.
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tipos de Cliente
              </CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.tiposCount ?? "..."}</div>
              <p className="text-xs text-muted-foreground">
                Total de tipos de cliente registrados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.clientesCount ?? "..."}</div>
              <p className="text-xs text-muted-foreground">
                Total de clientes activos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facturas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.facturasCount ?? "..."}</div>
              <p className="text-xs text-muted-foreground">
                Total de facturas emitidas
              </p>
            </CardContent>
          </Card>
        </div>

        {user && user.rawPermisos && (
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Respuesta API Seguridad (Temporal)</h3>
                <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                    <code>
                        {JSON.stringify(JSON.parse(user.rawPermisos), null, 2)}
                    </code>
                </pre>
            </div>
        )}

        {isDirectAccess && (
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Modo de Acceso</h3>
                <p className="p-4 bg-muted rounded-lg text-sm">Acceso Directo (Sin restricciones de permisos)</p>
            </div>
        )}
      </div>
    );
}

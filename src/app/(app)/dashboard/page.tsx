import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, FileText, Tag } from "lucide-react";

async function getStats() {
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


export default async function DashboardPage() {
    const { tiposCount, clientesCount, facturasCount } = await getStats();

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
              <div className="text-2xl font-bold">{tiposCount}</div>
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
              <div className="text-2xl font-bold">{clientesCount}</div>
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
              <div className="text-2xl font-bold">{facturasCount}</div>
              <p className="text-xs text-muted-foreground">
                Total de facturas emitidas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
}

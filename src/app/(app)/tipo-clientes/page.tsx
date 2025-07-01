import { PageHeader } from "@/components/page-header"
import { TipoCliente, Cliente } from "@/lib/types"
import { TipoClientesClient } from "./client"

async function getData(): Promise<TipoCliente[]> {
  try {
    const [tiposRes, clientesRes] = await Promise.all([
        fetch('https://apdis-p5v5.vercel.app/api/tipo_clientes/', { cache: 'no-store' }),
        fetch('https://apdis-p5v5.vercel.app/api/clientes/', { cache: 'no-store' })
    ]);
    
    if (!tiposRes.ok) throw new Error('Failed to fetch tipos');
    if (!clientesRes.ok) throw new Error('Failed to fetch clientes');
    
    const tipos: TipoCliente[] = await tiposRes.json();
    const clientes: Cliente[] = await clientesRes.json();

    const usedTipoIds = new Set(clientes.map(c => Number(c.tipo_cliente)));

    const tiposWithStatus = tipos.map(tipo => ({
        ...tipo,
        isDeletable: !usedTipoIds.has(tipo.id_tipcli)
    }));
    
    return tiposWithStatus;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function TipoClientesPage() {
  const data = await getData()

  return (
    <>
      <PageHeader title="Gestionar Tipos de Cliente" />
      <div className="p-4 sm:p-6 md:p-8 border rounded-lg bg-card">
        <TipoClientesClient data={data} />
      </div>
    </>
  )
}

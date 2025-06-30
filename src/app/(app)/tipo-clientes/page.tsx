import { PageHeader } from "@/components/page-header"
import { TipoCliente } from "@/lib/types"
import { TipoClientesClient } from "./client"

async function getTiposClientes(): Promise<TipoCliente[]> {
  try {
    const response = await fetch('https://apdis-p5v5.vercel.app/api/tipo_clientes/', { cache: 'no-store' });
    if (!response.ok) {
        throw new Error('Failed to fetch data')
    }
    return response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function TipoClientesPage() {
  const data = await getTiposClientes()

  return (
    <>
      <PageHeader title="Gestionar Tipos de Cliente" />
      <div className="p-4 sm:p-6 md:p-8 border rounded-lg bg-card">
        <TipoClientesClient data={data} />
      </div>
    </>
  )
}

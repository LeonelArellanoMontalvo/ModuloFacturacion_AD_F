import { PageHeader } from "@/components/page-header";
import { Cliente, TipoCliente } from "@/lib/types";
import { ClientesClient } from "./client";

async function getClientes(): Promise<Cliente[]> {
  try {
    const response = await fetch('https://apdis-p5v5.vercel.app/api/clientes/', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch clientes');
    return response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getTiposClientes(): Promise<TipoCliente[]> {
  try {
    const response = await fetch('https://apdis-p5v5.vercel.app/api/tipo_clientes/', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch tipos de clientes');
    return response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function ClientesPage() {
  const [clientes, tiposClientes] = await Promise.all([getClientes(), getTiposClientes()]);

  return (
    <>
      <PageHeader title="Gestionar Clientes" />
      <div className="p-4 sm:p-6 md:p-8 border rounded-lg bg-card">
        <ClientesClient data={clientes} tipos={tiposClientes} />
      </div>
    </>
  );
}

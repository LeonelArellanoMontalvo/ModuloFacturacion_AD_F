import { PageHeader } from "@/components/page-header"
import { Factura, Cliente } from "@/lib/types"
import { FacturasClient } from "./client"

async function getData(): Promise<{facturas: Factura[], clientes: Cliente[]}> {
  try {
    const [facturasRes, clientesRes] = await Promise.all([
      fetch('https://apdis-p5v5.vercel.app/api/facturas/', { cache: 'no-store' }),
      fetch('https://apdis-p5v5.vercel.app/api/clientes/', { cache: 'no-store' }),
    ]);

    if (!facturasRes.ok) throw new Error('Failed to fetch facturas');
    if (!clientesRes.ok) throw new Error('Failed to fetch clientes');
    
    const facturas: Factura[] = await facturasRes.json();
    const clientes: Cliente[] = await clientesRes.json();

    return { facturas, clientes };
  } catch (error) {
    console.error(error);
    return { facturas: [], clientes: [] };
  }
}

export default async function FacturasPage() {
  const { facturas, clientes } = await getData();

  const facturasWithClientes = facturas.map(factura => ({
      ...factura,
      cliente: clientes.find(c => c.id_cliente === factura.id_cliente)
  }));

  return (
    <>
      <PageHeader title="Gestionar Facturas" />
      <div className="p-4 sm:p-6 md:p-8 border rounded-lg bg-card">
        <FacturasClient data={facturasWithClientes} clientes={clientes} />
      </div>
    </>
  )
}

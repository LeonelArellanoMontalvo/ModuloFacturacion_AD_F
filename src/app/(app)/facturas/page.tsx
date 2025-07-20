
import { PageHeader } from "@/components/page-header"
import { Factura, Cliente } from "@/lib/types"
import { FacturasClient } from "./client"
import { updateFacturaStatus } from "@/lib/actions";

interface Deudor {
    id_cliente: number;
    facturas_pendientes: { id_factura: number }[];
}

async function getData(): Promise<{facturas: Factura[], clientes: Cliente[]}> {
  try {
    const [facturasRes, clientesRes, deudoresRes] = await Promise.all([
      fetch('https://apdis-p5v5.vercel.app/api/facturas/', { cache: 'no-store' }),
      fetch('https://apdis-p5v5.vercel.app/api/clientes/', { cache: 'no-store' }),
      fetch('https://module-cuentasporcobrar-api.onrender.com/api/clientes/deudores', { cache: 'no-store' })
    ]);

    if (!facturasRes.ok) throw new Error('Failed to fetch facturas');
    if (!clientesRes.ok) throw new Error('Failed to fetch clientes');
    
    let facturasData: any[] = await facturasRes.json();
    const clientes: Cliente[] = await clientesRes.json();
    
    // Process deudores and update facturas if necessary
    if (deudoresRes.ok) {
        const deudores: Deudor[] = await deudoresRes.json();
        const pendingInvoiceIds = new Set(
            deudores.flatMap(d => d.facturas_pendientes.map(f => f.id_factura))
        );

        const updatePromises: Promise<any>[] = [];
        const facturasToKeep: any[] = [];

        facturasData.forEach(factura => {
            const isCreditAndPending = factura.tipo_pago === 'Credito' && factura.estado_factura === 'Pendiente';
            if (isCreditAndPending && !pendingInvoiceIds.has(factura.id_factura)) {
                // This invoice is no longer pending according to deudores, so update it.
                console.log(`Factura ${factura.id_factura} will be updated to 'Pagado'.`);
                const { cliente, detalles, ...facturaPayload } = factura;
                updatePromises.push(updateFacturaStatus(factura.id_factura, facturaPayload));
                // We reflect the change immediately in the UI
                facturasToKeep.push({ ...factura, estado_factura: 'Pagado' });
            } else {
                 facturasToKeep.push(factura);
            }
        });

        if (updatePromises.length > 0) {
            await Promise.all(updatePromises);
            console.log(`${updatePromises.length} facturas statuses updated.`);
            facturasData = facturasToKeep;
        }
    } else {
        console.warn("Could not fetch deudores data. Skipping invoice status sync.");
    }
    
    const facturas: Factura[] = facturasData.map(f => ({
      ...f,
      monto_total: parseFloat(f.monto_total)
    }));

    const sortedFacturas = facturas.sort((a,b) => b.id_factura - a.id_factura);

    return { facturas: sortedFacturas, clientes };
  } catch (error) {
    console.error(error);
    return { facturas: [], clientes: [] };
  }
}

export default async function FacturasPage() {
  const { facturas, clientes } = await getData();

  const facturasWithClientes = facturas.map(factura => ({
      ...factura,
      cliente: clientes.find(c => c.id_cliente === factura.id_cliente),
      isDeletable: true,
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

import { PageHeader } from "@/components/page-header"
import { Cliente, Producto } from "@/lib/types"
import { CrearFacturaForm } from "./form"
import { Card, CardContent } from "@/components/ui/card"

async function getData(): Promise<{ clientes: Cliente[], productos: Producto[] }> {
    try {
        const [clientesRes, productosRes] = await Promise.all([
            fetch('https://apdis-p5v5.vercel.app/api/clientes/', { cache: 'no-store' }),
            fetch('https://productos-three-orpin.vercel.app/api/productos', { cache: 'no-store' })
        ]);
        
        if (!clientesRes.ok) throw new Error('Failed to fetch clientes');
        if (!productosRes.ok) throw new Error('Failed to fetch productos');
        
        const clientes: Cliente[] = await clientesRes.json();
        const productosData: any[] = await productosRes.json();

        // Transform products to match the internal Producto interface
        const productos: Producto[] = productosData.map((p: any) => ({
            id_producto: p.id_producto,
            nombre: p.nombre,
            descripcion: p.descripcion,
            precio: parseFloat(p.precio_unitario),
            stock_disponible: Number(p.stock_minimo)
        }));
        
        const activeClientes = clientes.filter(c => c.estado?.toLowerCase() === 'activo');
        // New product API does not have 'estado', so we consider all as active.
        const activeProductos = productos;

        return { clientes: activeClientes, productos: activeProductos };
    } catch (error) {
        console.error(error);
        return { clientes: [], productos: [] };
    }
}


export default async function CrearFacturaPage() {
    const { clientes, productos } = await getData();

    return (
        <>
            <PageHeader title="Crear Nueva Factura" />
            <Card>
                <CardContent className="p-6">
                    <CrearFacturaForm clientes={clientes} productos={productos} />
                </CardContent>
            </Card>
        </>
    )
}


import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cliente, DetalleFactura, Factura } from "@/lib/types";
import { AlertTriangle, FileText } from "lucide-react";
import { format } from 'date-fns';
import { PrintControls } from "./print-controls";
import { UpdateTitle } from "./update-title";

interface DetalleResponse {
    id_factura: number;
    detalles: DetalleFactura[];
}

async function getData(id: string): Promise<{ factura: Factura | null; cliente: Cliente | null; detalles: DetalleFactura[] }> {
    try {
        const facturaId = parseInt(id, 10);
        if (isNaN(facturaId)) throw new Error("ID de factura inválido");

        const [facturaRes, detallesRes, clientesRes] = await Promise.all([
            fetch(`https://apdis-p5v5.vercel.app/api/facturas/${facturaId}/`, { cache: 'no-store' }),
            fetch(`https://apdis-p5v5.vercel.app/api/detalle_facturas/`, { cache: 'no-store' }),
            fetch(`https://apdis-p5v5.vercel.app/api/clientes/`, { cache: 'no-store' })
        ]);

        if (!facturaRes.ok) throw new Error('No se pudo obtener la factura');
        const facturaData: any = await facturaRes.json();
        const factura: Factura = {
            ...facturaData,
            monto_total: parseFloat(facturaData.monto_total || '0')
        };
        
        if (!detallesRes.ok) throw new Error('No se pudieron obtener los detalles de la factura');
        const allDetails: DetalleResponse[] = await detallesRes.json();
        const detalles = allDetails.find(d => d.id_factura === facturaId)?.detalles || [];

        if (!clientesRes.ok) throw new Error('No se pudieron obtener los clientes');
        const clientes: Cliente[] = await clientesRes.json();
        const cliente = clientes.find(c => c.id_cliente === factura.id_cliente) || null;

        return { factura, cliente, detalles };

    } catch (error) {
        console.error("Error al obtener datos de la factura para imprimir:", error);
        return { factura: null, cliente: null, detalles: [] };
    }
}


export default async function ImprimirFacturaPage({ params }: { params: { id: string } }) {
    const { factura, cliente, detalles } = await getData(params.id);

    if (!factura || !cliente) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        No se pudo cargar la información de la factura. Por favor, intente de nuevo o regrese a la lista.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
    
    const formatDate = (dateString: string) => {
        try {
            if (!dateString || !dateString.includes('T')) return "Fecha inválida";
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Fecha inválida";
            return format(date, 'dd/MM/yyyy');
        } catch {
            return "Fecha inválida";
        }
    };
    
    const formattedDate = formatDate(factura.fecha_factura);
    const fileName = `${factura.numero_factura} - ${cliente.nombre} ${cliente.apellido} - ${formattedDate.replace(/\//g, '-')}`;

    return (
        <>
            <UpdateTitle title={fileName} />
            <PageHeader 
                title={`Factura ${factura.numero_factura}`} 
                className="no-print"
                action={<PrintControls />} 
            />
            <div className="printable-area">
                <Card className="border-2 shadow-lg">
                    <CardHeader className="bg-muted/30">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3">
                                    <FileText className="h-10 w-10 text-primary" />
                                    <div>
                                        <CardTitle className="text-3xl font-bold text-primary">FACTURA</CardTitle>
                                        <p className="font-semibold text-destructive">N° {factura.numero_factura}</p>
                                    </div>
                                </div>
                                <div className="mt-4 text-sm text-muted-foreground">
                                    <p><span className="font-semibold">Fecha de Emisión:</span> {formattedDate}</p>
                                    <p><span className="font-semibold">Estado:</span> <span className="font-bold capitalize">{factura.estado_factura}</span></p>
                                    <p><span className="font-semibold">Método de Pago:</span> {factura.tipo_pago}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h3 className="text-lg font-bold font-headline">APDIS Manager</h3>
                                <p className="text-sm text-muted-foreground">Av. Siempre Viva 123, Quito</p>
                                <p className="text-sm text-muted-foreground">info@apdis.com</p>
                                <p className="text-sm text-muted-foreground">(02) 234-5678</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold border-b pb-2 mb-2 text-primary">Datos del Cliente</h4>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                                <p><span className="font-semibold text-muted-foreground">Nombre:</span> {cliente.nombre} {cliente.apellido}</p>
                                <p><span className="font-semibold text-muted-foreground">Dirección:</span> {cliente.direccion}</p>
                                <p><span className="font-semibold text-muted-foreground">{cliente.tipo_identificacion}:</span> {cliente.numero_identificacion}</p>
                                <p><span className="font-semibold text-muted-foreground">Teléfono:</span> {cliente.telefono}</p>
                                <p><span className="font-semibold text-muted-foreground">Email:</span> {cliente.correo_electronico}</p>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <div>
                            <h4 className="text-lg font-semibold mb-2 text-primary">Detalles de la Factura</h4>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">ID Prod.</TableHead>
                                        <TableHead>Producto</TableHead>
                                        <TableHead className="text-center">Cantidad</TableHead>
                                        <TableHead className="text-right">Precio Unit.</TableHead>
                                        <TableHead className="text-right">Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {detalles.map(item => (
                                        <TableRow key={item.id_detalle_factura}>
                                            <TableCell>{item.id_producto}</TableCell>
                                            <TableCell>{item.nombre}</TableCell>
                                            <TableCell className="text-center">{item.cantidad}</TableCell>
                                            <TableCell className="text-right">${parseFloat(item.precio_unitario).toFixed(2)}</TableCell>
                                            <TableCell className="text-right">${parseFloat(item.total_producto).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        
                        <Separator className="my-6" />

                        <div className="flex justify-end">
                            <div className="w-full max-w-sm space-y-2 text-right">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span>${factura.monto_total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">IVA (12%):</span>
                                    <span>$0.00</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg text-primary">
                                    <span>TOTAL:</span>
                                    <span>${factura.monto_total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

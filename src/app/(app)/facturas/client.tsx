"use client";

import React, { useState, useMemo, useTransition, useCallback } from "react";
import Link from "next/link";
import { Factura, Cliente, DetalleFactura } from "@/lib/types";
import { getColumns } from "./columns";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle, AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { deleteFactura } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface DetalleResponse {
    id_factura: number;
    detalles: DetalleFactura[];
}

async function getDetalles(facturaId: number): Promise<DetalleFactura[]> {
    try {
        const res = await fetch(`https://apdis-p5v5.vercel.app/api/detalle_facturas/`, { cache: 'no-store' });
        if (!res.ok) {
            console.error(`Failed to fetch details for factura ${facturaId}`);
            return [];
        }
        
        const allDetails: DetalleResponse[] = await res.json();
        
        const facturaDetails = allDetails.find(item => item.id_factura === facturaId);

        return facturaDetails ? facturaDetails.detalles : [];
    } catch (error) {
        console.error("Error parsing details response:", error);
        return [];
    }
}


interface FacturasClientProps {
  data: Factura[];
  clientes: Cliente[];
}

export function FacturasClient({ data, clientes }: FacturasClientProps) {
  const { toast } = useToast();

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleting, startDeleting] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [facturaToDelete, setFacturaToDelete] = useState<number | null>(null);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [detalles, setDetalles] = useState<DetalleFactura[]>([]);
  const [isLoadingDetalles, startLoadingDetalles] = useTransition();

  const noClientes = clientes.length === 0;

  const handleViewDetails = useCallback((factura: Factura) => {
    setSelectedFactura(factura);
    setIsDetailsOpen(true);
    startLoadingDetalles(async () => {
        const detallesData = await getDetalles(factura.id_factura);
        setDetalles(detallesData);
    });
  }, []);

  const handleDeleteRequest = useCallback((id: number) => {
    setFacturaToDelete(id);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (facturaToDelete === null) return;
    startDeleting(async () => {
        const result = await deleteFactura(facturaToDelete);
        if (result?.error) {
          toast({
            title: "Error al eliminar",
            description: result.error,
            variant: "destructive",
          });
        } else {
          toast({
              title: "Factura eliminada",
              description: "La factura ha sido eliminada exitosamente.",
          });
        }
        setIsDeleteDialogOpen(false);
        setFacturaToDelete(null);
    });
  }, [facturaToDelete, toast]);
  
  const columns = useMemo(() => getColumns(handleDeleteRequest, handleViewDetails), [handleDeleteRequest, handleViewDetails]);

  return (
    <>
      {noClientes && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atención</AlertTitle>
          <AlertDescription>
            No puede crear una factura porque no hay clientes registrados. Por favor, cree un cliente primero.
          </AlertDescription>
        </Alert>
      )}
      <DataTable
        columns={columns}
        data={data}
        toolbar={
          <Link href="/facturas/crear" passHref>
            <Button disabled={noClientes}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Factura
            </Button>
          </Link>
        }
      />

    <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Factura {selectedFactura?.numero_factura}</DialogTitle>
            {selectedFactura && (
                 <DialogDescription>
                    Cliente: {selectedFactura.cliente?.nombre} {selectedFactura.cliente?.apellido} | Fecha: {format(new Date(selectedFactura.fecha_factura), 'dd/MM/yyyy')}
                </DialogDescription>
            )}
          </DialogHeader>
          {isLoadingDetalles ? (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Cantidad</TableHead>
                            <TableHead className="text-right">Precio Unit.</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {detalles.map(d => (
                            <TableRow key={d.id_detalle_factura}>
                                <TableCell>{d.nombre || 'N/A'}</TableCell>
                                <TableCell>{d.cantidad}</TableCell>
                                <TableCell className="text-right">${(parseFloat(d.precio_unitario) || 0).toFixed(2)}</TableCell>
                                <TableCell className="text-right">${(parseFloat(d.subtotal) || 0).toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente la factura y sus detalles.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

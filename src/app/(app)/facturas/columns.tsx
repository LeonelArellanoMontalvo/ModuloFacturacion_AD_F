"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Factura } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal } from "lucide-react"
import { format } from 'date-fns';


export const getColumns = (
  onDelete: (id: number) => void,
  onViewDetails: (factura: Factura) => void
): ColumnDef<Factura>[] => [
  {
    id: "actions",
    cell: ({ row }) => {
      const factura = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onViewDetails(factura)}>
              Mostrar Detalles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(factura.id_factura)} className="text-destructive">
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
  {
    accessorKey: "numero_factura",
    header: "N° Factura",
  },
  {
    accessorKey: "cliente",
    header: "Cliente",
    cell: ({ row }) => {
      const cliente = row.original.cliente;
      return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'N/A';
    }
  },
  {
    accessorKey: "fecha_factura",
    header: "Fecha de Factura",
    cell: ({ row }) => {
        try {
            return format(new Date(row.getValue("fecha_factura")), 'dd/MM/yyyy');
        } catch (error) {
            return "Fecha inválida";
        }
    }
  },
  {
    accessorKey: "monto_total",
    header: "Monto Total",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("monto_total"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
 
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "estado_factura",
    header: "Estado",
    cell: ({ row }) => {
        const status = (row.getValue("estado_factura") as string || "").toLowerCase();
        let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
        
        if (status === 'pagado') variant = 'default';
        else if (status === 'no pagada' || status === 'pendiente' || status === 'credito') variant = 'outline';
        else if (status === 'anulada') variant = 'destructive';
        
        return <Badge variant={variant} className="capitalize">{row.getValue("estado_factura")}</Badge>;
    }
  },
]

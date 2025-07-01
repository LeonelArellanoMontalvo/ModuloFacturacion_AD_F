"use client"

import { ColumnDef } from "@tanstack/react-table"
import { TipoCliente } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export const getColumns = (
  onEdit: (tipo: TipoCliente) => void,
  onDelete: (id: number) => void
): ColumnDef<TipoCliente>[] => [
  {
    id: "uso",
    header: "Uso",
    cell: ({ row }) => {
      const isDeletable = row.original.isDeletable
      const tooltipText = isDeletable ? "Este registro puede ser eliminado." : "Este registro está en uso y no puede ser eliminado."

      return (
        <Tooltip>
          <TooltipTrigger>
            <div className={`h-2.5 w-2.5 rounded-full ${isDeletable ? 'bg-green-500' : 'bg-red-500'}`} />
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const tipoCliente = row.original

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
            <DropdownMenuItem onClick={() => onEdit(tipoCliente)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(tipoCliente.id_tipcli)} 
              className="text-destructive"
              disabled={!tipoCliente.isDeletable}
            >
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
  {
    accessorKey: "id_tipcli",
    header: "ID",
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "monto_maximo",
    header: "Monto Máximo",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("monto_maximo"))
      const formatted = new Intl.NumberFormat("es-EC", {
        style: "currency",
        currency: "USD",
      }).format(amount)
 
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
]

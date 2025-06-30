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

export const getColumns = (
  onEdit: (tipo: TipoCliente) => void,
  onDelete: (id: number) => void
): ColumnDef<TipoCliente>[] => [
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
            <DropdownMenuItem onClick={() => onDelete(tipoCliente.id)} className="text-destructive">
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
  },
]

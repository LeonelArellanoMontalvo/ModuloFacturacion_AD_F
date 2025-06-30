"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Cliente } from "@/lib/types"
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

export const getColumns = (
  onEdit: (cliente: Cliente) => void,
  onDelete: (id: number) => void
): ColumnDef<Cliente>[] => [
  {
    id: "actions",
    cell: ({ row }) => {
      const cliente = row.original;
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
            <DropdownMenuItem onClick={() => onEdit(cliente)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(cliente.id)} className="text-destructive">
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => `${row.original.nombre} ${row.original.apellido}`,
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "telefono",
    header: "Teléfono",
  },
  {
    accessorKey: "tipo_cliente.descripcion",
    header: "Tipo",
    cell: ({ row }) => row.original.tipo_cliente?.descripcion || 'N/A',
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const isActive = row.getValue("estado");
      return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Activo" : "Inactivo"}</Badge>;
    },
  },
]

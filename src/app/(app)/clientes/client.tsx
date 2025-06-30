"use client";

import React, { useState, useMemo, useTransition } from "react";
import { Cliente, TipoCliente } from "@/lib/types";
import { getColumns } from "./columns";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ClienteForm, FormValues } from "./form";
import { createCliente, updateCliente, deleteCliente } from "@/lib/actions";
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

interface ClientesClientProps {
  data: Cliente[];
  tipos: TipoCliente[];
}

export function ClientesClient({ data, tipos }: ClientesClientProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCliente, setCurrentCliente] = useState<Cliente | null>(null);
  const [clienteToDelete, setClienteToDelete] = useState<number | null>(null);

  const noTipos = tipos.length === 0;

  const handleCreate = () => {
    if (noTipos) return;
    setCurrentCliente(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (cliente: Cliente) => {
    setCurrentCliente(cliente);
    setIsDialogOpen(true);
  };

  const handleDeleteRequest = (id: number) => {
    setClienteToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (clienteToDelete === null) return;
    startTransition(async () => {
        await deleteCliente(clienteToDelete);
        toast({
            title: "Cliente eliminado",
            description: "El cliente ha sido eliminado exitosamente.",
        });
        setIsDeleteDialogOpen(false);
        setClienteToDelete(null);
    });
  };

  const handleSubmit = (values: FormValues) => {
    startTransition(async () => {
      const action = currentCliente ? updateCliente(currentCliente.id_cliente, values) : createCliente(values);
      const result = await action;

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Éxito",
          description: `Cliente ${currentCliente ? 'actualizado' : 'creado'} con éxito.`,
        });
        setIsDialogOpen(false);
        setCurrentCliente(null);
      }
    });
  };

  const columns = useMemo(() => getColumns(handleEdit, handleDeleteRequest), []);

  return (
    <>
      {noTipos && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atención</AlertTitle>
          <AlertDescription>
            No puede crear un cliente porque no hay tipos de cliente definidos. Por favor, cree un tipo de cliente primero.
          </AlertDescription>
        </Alert>
      )}
      <DataTable
        columns={columns}
        data={data}
        toolbar={
          <Button onClick={handleCreate} disabled={noTipos}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Cliente
          </Button>
        }
      />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentCliente ? "Editar" : "Crear"} Cliente</DialogTitle>
            <DialogDescription>
              {currentCliente ? "Edite los detalles del cliente." : "Complete el formulario para crear un nuevo cliente."}
            </DialogDescription>
          </DialogHeader>
          <ClienteForm
            onSubmit={handleSubmit}
            defaultValues={currentCliente}
            isPending={isPending}
            tipos={tipos}
          />
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente al cliente.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isPending}>
                {isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

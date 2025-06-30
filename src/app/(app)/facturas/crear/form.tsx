"use client"

import React, { useEffect, useMemo, useState, useTransition } from "react"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createFactura } from "@/lib/actions"
import { facturaSchema } from "@/lib/schemas"
import type { Cliente, Producto } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Plus } from "lucide-react"

type FormValues = z.infer<typeof facturaSchema>;

interface CrearFacturaFormProps {
  clientes: Cliente[];
  productos: Producto[];
}

export function CrearFacturaForm({ clientes, productos }: CrearFacturaFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(facturaSchema),
    defaultValues: {
      header: {
        id_cliente: undefined,
        tipo_pago: "",
        estado_factura: "Pendiente",
      },
      detalles: [{ id_producto: undefined, cantidad: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "detalles",
  });

  const selectedClientId = useWatch({ control: form.control, name: "header.id_cliente" });
  const selectedCliente = useMemo(() => clientes.find(c => c.id_cliente === Number(selectedClientId)), [selectedClientId, clientes]);

  const detalles = useWatch({ control: form.control, name: 'detalles' });

  const totalFactura = useMemo(() => {
    return detalles.reduce((acc, detalle) => {
        const producto = productos.find(p => p.id === Number(detalle.id_producto));
        const cantidad = Number(detalle.cantidad) || 0;
        const precio = producto?.precio || 0;
        return acc + (cantidad * precio);
    }, 0);
  }, [detalles, productos]);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const result = await createFactura(values);
      if (result?.error) {
        toast({
          title: "Error al crear factura",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Factura Creada",
          description: "La factura se ha guardado exitosamente.",
        })
        router.push('/facturas');
      }
    })
  }

  const selectedProductIds = useMemo(() => detalles.map(d => d.id_producto), [detalles]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Invoice Header */}
        <Card>
          <CardHeader>
            <CardTitle>Datos de la Factura</CardTitle>
            <CardDescription>Seleccione un cliente y complete los datos de la cabecera.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="header.id_cliente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un cliente" /></SelectTrigger></FormControl>
                    <SelectContent>{clientes.map(c => <SelectItem key={c.id_cliente} value={String(c.id_cliente)}>{c.nombre} {c.apellido}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedCliente && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm p-4 border rounded-lg bg-muted">
                <div><span className="font-semibold">Dirección:</span> {selectedCliente.direccion}</div>
                <div><span className="font-semibold">Email:</span> {selectedCliente.correo_electronico}</div>
                <div><span className="font-semibold">Teléfono:</span> {selectedCliente.telefono}</div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="header.tipo_pago"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo de Pago</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un tipo" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                                    <SelectItem value="Tarjeta de Credito">Tarjeta de Crédito</SelectItem>
                                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="header.estado_factura"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Estado de la Factura</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un estado" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Pagada">Pagada</SelectItem>
                                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                                    <SelectItem value="Anulada">Anulada</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Invoice Details */}
        <Card>
            <CardHeader>
                <CardTitle>Detalles de la Factura</CardTitle>
                <CardDescription>Agregue los productos a la factura.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {fields.map((field, index) => {
                    const selectedProductoId = detalles[index]?.id_producto;
                    const producto = productos.find(p => p.id === Number(selectedProductoId));
                    const subtotal = (producto?.precio || 0) * (detalles[index]?.cantidad || 0);

                    return (
                        <div key={field.id} className="flex flex-wrap md:flex-nowrap items-start gap-4 p-4 border rounded-lg relative">
                             <FormField
                                control={form.control}
                                name={`detalles.${index}.id_producto`}
                                render={({ field }) => (
                                    <FormItem className="flex-1 min-w-[200px]">
                                        <FormLabel>Producto</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un producto" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {productos.map(p => (
                                                    <SelectItem key={p.id} value={String(p.id)} disabled={selectedProductIds.includes(p.id) && p.id !== Number(field.value)}>
                                                        {p.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`detalles.${index}.cantidad`}
                                render={({ field }) => (
                                    <FormItem className="w-full md:w-24">
                                        <FormLabel>Cantidad</FormLabel>
                                        <FormControl><Input type="number" min="1" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormItem className="w-full md:w-32">
                                <FormLabel>Precio Unit.</FormLabel>
                                <Input value={`$${(producto?.precio || 0).toFixed(2)}`} readOnly className="bg-muted"/>
                            </FormItem>
                             <FormItem className="w-full md:w-32">
                                <FormLabel>Subtotal</FormLabel>
                                <Input value={`$${subtotal.toFixed(2)}`} readOnly className="bg-muted" />
                            </FormItem>
                            <Button type="button" variant="ghost" size="icon" className="text-destructive absolute top-1 right-1" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </div>
                    )
                })}

                <Button type="button" variant="outline" size="sm" onClick={() => append({ id_producto: undefined, cantidad: 1 })}>
                    <Plus className="mr-2 h-4 w-4" /> Agregar Detalle
                </Button>
            </CardContent>
        </Card>
        
        <div className="flex justify-end items-center gap-6 p-4 border rounded-lg">
            <div className="text-xl font-bold">Total Factura:</div>
            <div className="text-2xl font-bold text-primary">${totalFactura.toFixed(2)}</div>
        </div>


        <Button type="submit" className="w-full md:w-auto" disabled={isPending}>
          {isPending ? "Guardando Factura..." : "Guardar Factura"}
        </Button>
      </form>
    </Form>
  )
}

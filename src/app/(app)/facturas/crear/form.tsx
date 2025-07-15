"use client"

import React, { useMemo, useTransition, useState } from "react"
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

type FormValues = z.infer<typeof facturaSchema>;

interface CrearFacturaFormProps {
  clientes: Cliente[];
  productos: Producto[];
}

export function CrearFacturaForm({ clientes, productos }: CrearFacturaFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const router = useRouter()
  const { toast } = useToast()
  const [productSearch, setProductSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");

  const facturaSchemaWithStockValidation = useMemo(() => {
    return facturaSchema.superRefine((data, ctx) => {
      data.detalles.forEach((detalle, index) => {
        if (!detalle.id_producto) return;
        
        const producto = productos.find(p => p.id_producto === Number(detalle.id_producto));
        if (producto) {
            if (Number(detalle.cantidad) > producto.stock_disponible) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Stock insuficiente. Disp: ${producto.stock_disponible}`,
                    path: [`detalles`, index, `cantidad`],
                });
            }
        }
      });
    });
  }, [productos]);

  const form = useForm<FormValues>({
    resolver: zodResolver(facturaSchemaWithStockValidation),
    mode: "onChange",
    defaultValues: {
      header: {
        id_cliente: undefined,
        tipo_pago: "Efectivo",
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
        const producto = productos.find(p => p.id_producto === Number(detalle.id_producto));
        const cantidad = Number(detalle.cantidad) || 0;
        const precio = producto?.precio || 0;
        return acc + (cantidad * precio);
    }, 0);
  }, [detalles, productos]);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const result = await createFactura(values);
      if (result?.success && result.newFacturaId) {
        toast({
          title: "Factura Creada",
          description: "La factura se ha guardado exitosamente.",
        });
        router.push(`/facturas/${result.newFacturaId}/imprimir`);
      } else if (result?.error) {
        toast({
          title: "Error al crear factura",
          description: result.error,
          variant: "destructive",
        })
      }
    })
  }

  const filteredClientes = useMemo(() => {
    if (!clientSearch) return clientes;
    const searchLower = clientSearch.toLowerCase();
    return clientes.filter(c => 
      `${c.nombre} ${c.apellido}`.toLowerCase().includes(searchLower) ||
      c.numero_identificacion.includes(searchLower)
    );
  }, [clientSearch, clientes]);
  
  const filteredProductos = useMemo(() => {
    if (!productSearch) return productos;
    return productos.filter(p => p.nombre.toLowerCase().includes(productSearch.toLowerCase()));
  }, [productSearch, productos]);

  const selectedProductIds = useMemo(() => detalles.map(d => Number(d.id_producto)), [detalles]);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setIsCancelDialogOpen(true)} disabled={isPending}>
                  Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando Factura..." : "Guardar Factura"}
              </Button>
          </div>

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
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Buscar cliente por nombre o ID..."
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <Separator />
                        <div className="max-h-[200px] overflow-y-auto">
                          {filteredClientes.map(c => (
                            <SelectItem key={c.id_cliente} value={String(c.id_cliente)}>
                              {c.nombre} {c.apellido} ({c.numero_identificacion})
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {selectedCliente && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormItem>
                    <FormLabel>Tipo Identificación</FormLabel>
                    <FormControl>
                      <Input value={selectedCliente.tipo_identificacion || ''} readOnly className="bg-muted" />
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormLabel>N° Identificación</FormLabel>
                    <FormControl>
                      <Input value={selectedCliente.numero_identificacion || ''} readOnly className="bg-muted" />
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input value={selectedCliente.direccion || ''} readOnly className="bg-muted" />
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input value={selectedCliente.correo_electronico || ''} readOnly className="bg-muted" />
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input value={selectedCliente.telefono || ''} readOnly className="bg-muted" />
                    </FormControl>
                  </FormItem>
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
                                      <SelectItem value="Credito">Crédito</SelectItem>
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
                                      <SelectItem value="Pagado">Pagado</SelectItem>
                                      <SelectItem value="Pendiente">Pendiente</SelectItem>
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
                      const producto = productos.find(p => p.id_producto === Number(selectedProductoId));
                      const subtotal = (producto?.precio || 0) * (detalles[index]?.cantidad || 0);

                      return (
                          <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg relative">
                              <FormField
                                  control={form.control}
                                  name={`detalles.${index}.id_producto`}
                                  render={({ field }) => (
                                      <FormItem className="md:col-span-3">
                                          <FormLabel>Producto</FormLabel>
                                          <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                              <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un producto" /></SelectTrigger></FormControl>
                                              <SelectContent>
                                                  <div className="p-2">
                                                    <Input
                                                      placeholder="Buscar producto..."
                                                      value={productSearch}
                                                      onChange={(e) => setProductSearch(e.target.value)}
                                                      autoFocus
                                                      className="w-full"
                                                    />
                                                  </div>
                                                  <Separator />
                                                  <div className="max-h-[200px] overflow-y-auto">
                                                    {filteredProductos.map(p => (
                                                        <SelectItem key={p.id_producto} value={String(p.id_producto)} disabled={selectedProductIds.includes(p.id_producto) && p.id_producto !== Number(field.value)}>
                                                            {p.nombre}
                                                        </SelectItem>
                                                    ))}
                                                  </div>
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
                                      <FormItem className="md:col-span-2">
                                          <FormLabel>Cantidad</FormLabel>
                                          <FormControl><Input type="number" min="1" {...field} /></FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                              <FormItem className="md:col-span-2">
                                  <FormLabel>Stock Disp.</FormLabel>
                                  <Input value={producto?.stock_disponible ?? 'N/A'} readOnly className="bg-muted"/>
                              </FormItem>
                              <FormItem className="md:col-span-1">
                                  <FormLabel>IVA</FormLabel>
                                  <Input value={producto ? (producto.graba_iva ? 'Sí' : 'No') : 'N/A'} readOnly className="bg-muted text-center" />
                              </FormItem>
                              <FormItem className="md:col-span-2">
                                  <FormLabel>Precio Unit.</FormLabel>
                                  <Input value={`$${(producto?.precio || 0).toFixed(2)}`} readOnly className="bg-muted text-right"/>
                              </FormItem>
                              <FormItem className="md:col-span-2">
                                  <FormLabel>Subtotal</FormLabel>
                                  <Input value={`$${subtotal.toFixed(2)}`} readOnly className="bg-muted text-right" />
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
        </form>
      </Form>
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de que desea cancelar?</AlertDialogTitle>
            <AlertDialogDescription>
                Todos los cambios no guardados se perderán. Esta acción no se puede deshacer.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Continuar Editando</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/facturas')}>
                Sí, Cancelar
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

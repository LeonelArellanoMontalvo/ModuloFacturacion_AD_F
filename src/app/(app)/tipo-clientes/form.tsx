"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { tipoClienteSchema } from "@/lib/actions"
import type { TipoCliente } from "@/lib/types"

export type FormValues = z.infer<typeof tipoClienteSchema>;

interface TipoClienteFormProps {
  onSubmit: (values: FormValues) => void;
  defaultValues?: TipoCliente | null;
  isPending: boolean;
}

export function TipoClienteForm({ onSubmit, defaultValues, isPending }: TipoClienteFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(tipoClienteSchema),
    defaultValues: {
      descripcion: defaultValues?.descripcion || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Mayorista" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar"}
        </Button>
      </form>
    </Form>
  )
}

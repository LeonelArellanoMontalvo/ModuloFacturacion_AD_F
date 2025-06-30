"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { tipoClienteSchema, clienteSchema, facturaSchema } from "@/lib/schemas";

const API_URL = "https://apdis-p5v5.vercel.app/api";

// Generic function for API calls
async function apiCall(path: string, options: RequestInit) {
  const url = `${API_URL}${path}`;
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`API Error (${response.status}) on ${options.method} ${url}:`, errorBody);
      throw new Error(`Error en la solicitud: ${response.statusText} - ${errorBody}`);
    }
    // For DELETE requests, response might be empty
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error(`Network or fetch error on ${options.method} ${url}:`, error);
    throw error;
  }
}

// TipoCliente Actions
export async function createTipoCliente(formData: z.infer<typeof tipoClienteSchema>) {
  const validatedFields = tipoClienteSchema.safeParse(formData);
  if (!validatedFields.success) {
    return { error: "Datos inválidos." };
  }
  await apiCall('/tipo_clientes/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validatedFields.data),
  });
  revalidatePath('/tipo-clientes');
  return { success: "Tipo de cliente creado." };
}

export async function updateTipoCliente(id: number, formData: z.infer<typeof tipoClienteSchema>) {
  const validatedFields = tipoClienteSchema.safeParse(formData);
  if (!validatedFields.success) {
    return { error: "Datos inválidos." };
  }
  await apiCall(`/tipo_clientes/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validatedFields.data),
  });
  revalidatePath('/tipo-clientes');
  return { success: "Tipo de cliente actualizado." };
}

export async function deleteTipoCliente(id: number) {
  await apiCall(`/tipo_clientes/${id}/`, { method: 'DELETE' });
  revalidatePath('/tipo-clientes');
}


// Cliente Actions
export async function createCliente(formData: z.infer<typeof clienteSchema>) {
  const validatedFields = clienteSchema.safeParse(formData);
  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors);
    return { error: "Datos inválidos." };
  }
  await apiCall('/clientes/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validatedFields.data),
  });
  revalidatePath('/clientes');
  return { success: "Cliente creado." };
}

export async function updateCliente(id: number, formData: z.infer<typeof clienteSchema>) {
    const validatedFields = clienteSchema.safeParse(formData);
    if (!validatedFields.success) {
        return { error: "Datos inválidos." };
    }
    await apiCall(`/clientes/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedFields.data),
    });
    revalidatePath('/clientes');
    return { success: "Cliente actualizado." };
}

export async function deleteCliente(id: number) {
  await apiCall(`/clientes/${id}/`, { method: 'DELETE' });
  revalidatePath('/clientes');
}

// Factura Actions
export async function createFactura(formData: z.infer<typeof facturaSchema>) {
  const validatedFields = facturaSchema.safeParse(formData);
  if (!validatedFields.success) {
    console.error("Validation Errors:", validatedFields.error.flatten().fieldErrors);
    return { error: "Datos inválidos. Verifique la cabecera y los detalles." };
  }

  const { header, detalles } = validatedFields.data;

  try {
    // 1. Create invoice header
    const newFactura = await apiCall('/facturas/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...header, monto_total: 0 }),
    });

    if (!newFactura || !newFactura.id_factura) {
      throw new Error("No se pudo crear la cabecera de la factura.");
    }

    // 2. Create invoice details
    const detallesPayload = {
      id_factura: newFactura.id_factura,
      productos: detalles,
    };

    await apiCall('/detalle_facturas/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(detallesPayload),
    });
    
  } catch (error) {
    console.error("Error al crear factura:", error);
    return { error: (error as Error).message || "Ocurrió un error al guardar la factura." };
  }

  revalidatePath('/facturas');
  return { success: "Factura creada exitosamente" };
}


export async function deleteFactura(id: number) {
  await apiCall(`/facturas/${id}/`, { method: 'DELETE' });
  revalidatePath('/facturas');
}

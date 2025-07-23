
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { tipoClienteSchema, clienteSchema, facturaSchema } from "@/lib/schemas";
import { cookies } from 'next/headers';

const API_URL = "https://apdis-p5v5.vercel.app/api";
const AUDITORIA_URL = "https://aplicacion-de-seguridad-v2.onrender.com/api/auditoria";

// Helper function to get user from cookies
function getUserFromCookies() {
  const cookieStore = cookies();
  const userCookie = cookieStore.get('user');
  if (userCookie) {
    try {
      return JSON.parse(userCookie.value);
    } catch {
      return null;
    }
  }
  return null;
}

// Generic function for sending audit logs
async function enviarAuditoria({
  accion,
  tabla,
  details,
  id_registro
}: {
  accion: 'CREATE' | 'UPDATE' | 'DELETE';
  tabla: string;
  details: object;
  id_registro?: number | string | null;
}) {
  const user = getUserFromCookies();
  if (!user || !user.token) {
    console.error("Audit Error: User or token not found.");
    return;
  }

  const { usuario, token } = user;
  
  const payload = {
    accion: accion.toUpperCase(),
    modulo: "FACTURACION",
    tabla,
    id_usuario: usuario, // Assuming the audit API can resolve the user by their username
    details: JSON.stringify({ ...details, id_registro }),
    nombre_rol: "Sistema", // Or extract a role from the user object if available
  };

  try {
    const response = await fetch(AUDITORIA_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Audit API Error (${response.status}):`, errorBody);
    } else {
        console.log(`Auditoría enviada con éxito para la acción: ${accion} en la tabla: ${tabla}`);
    }
  } catch (error) {
    console.error("Error al enviar auditoría:", (error as Error).message);
  }
}


// Generic function for API calls
async function apiCall(path: string, options: RequestInit) {
  const url = `${API_URL}${path}`;
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`API Error (${response.status}) on ${options.method} ${url}:`, errorBody);
      throw new Error(errorBody);
    }
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
  try {
    const newRecord = await apiCall('/tipo_clientes/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedFields.data),
    });
    revalidatePath('/tipo-clientes');
    await enviarAuditoria({
      accion: 'CREATE',
      tabla: 'tipo_clientes',
      details: validatedFields.data,
      id_registro: newRecord?.id_tipcli
    });
    return { success: "Tipo de cliente creado." };
  } catch (error: any) {
    const message = error.message as string;
    if (message?.includes("already exists")) {
      return { error: "Un tipo de cliente con este nombre ya existe." };
    }
    return { error: "No se pudo crear el tipo de cliente." };
  }
}

export async function updateTipoCliente(id: number, formData: z.infer<typeof tipoClienteSchema>) {
  const validatedFields = tipoClienteSchema.safeParse(formData);
  if (!validatedFields.success) {
    return { error: "Datos inválidos." };
  }
  try {
    await apiCall(`/tipo_clientes/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedFields.data),
    });
    revalidatePath('/tipo-clientes');
    await enviarAuditoria({
      accion: 'UPDATE',
      tabla: 'tipo_clientes',
      id_registro: id,
      details: validatedFields.data,
    });
    return { success: "Tipo de cliente actualizado." };
  } catch (error: any) {
    const message = error.message as string;
    if (message?.includes("already exists")) {
      return { error: "Un tipo de cliente con este nombre ya existe." };
    }
    return { error: "No se pudo actualizar el tipo de cliente." };
  }
}

export async function deleteTipoCliente(id: number) {
  try {
    await apiCall(`/tipo_clientes/${id}/`, { method: 'DELETE' });
    revalidatePath('/tipo-clientes');
    await enviarAuditoria({
      accion: 'DELETE',
      tabla: 'tipo_clientes',
      id_registro: id,
      details: { message: `Tipo cliente con id ${id} eliminado.` },
    });
    return { success: true };
  } catch (error) {
    return { error: "No se pudo eliminar el tipo de cliente. Es posible que esté en uso." };
  }
}


// Cliente Actions
async function handleClienteError(error: any): Promise<{ error: string, field?: string }> {
    try {
        const errorData = JSON.parse(error.message);
        if (errorData.details && (errorData.details.toLowerCase().includes('cédula inválida') || errorData.details.toLowerCase().includes('ruc inválido'))) {
            return { error: errorData.details, field: 'numero_identificacion' };
        }
        if (errorData.numero_identificacion) {
             return { error: "Un cliente con este número de identificación ya existe.", field: 'numero_identificacion' };
        }
    } catch (e) {
        if (error.message?.includes("already exists")) {
            return { error: "Un cliente con este número de identificación ya existe.", field: 'numero_identificacion' };
        }
    }
    return { error: "No se pudo procesar la solicitud. Verifique los datos e intente de nuevo." };
}

export async function createCliente(formData: z.infer<typeof clienteSchema>) {
    const validatedFields = clienteSchema.safeParse(formData);
    if (!validatedFields.success) {
        return { error: "Datos inválidos.", fieldErrors: validatedFields.error.flatten().fieldErrors };
    }
    const { fecha_nacimiento, ...rest } = validatedFields.data;
    const payload = {
        ...rest,
        fecha_nacimiento: fecha_nacimiento.toISOString().split('T')[0],
    };
    try {
        const newRecord = await apiCall('/clientes/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        revalidatePath('/clientes');
        await enviarAuditoria({
          accion: 'CREATE',
          tabla: 'clientes',
          id_registro: newRecord?.id_cliente,
          details: payload,
        });
        return { success: "Cliente creado." };
    } catch (error: any) {
        return handleClienteError(error);
    }
}

export async function updateCliente(id: number, formData: z.infer<typeof clienteSchema>) {
    const validatedFields = clienteSchema.safeParse(formData);
    if (!validatedFields.success) {
        return { error: "Datos inválidos.", fieldErrors: validatedFields.error.flatten().fieldErrors };
    }
    const { fecha_nacimiento, ...rest } = validatedFields.data;
    const payload = {
        ...rest,
        fecha_nacimiento: fecha_nacimiento.toISOString().split('T')[0],
    };
    try {
        await apiCall(`/clientes/${id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        revalidatePath('/clientes');
        await enviarAuditoria({
          accion: 'UPDATE',
          tabla: 'clientes',
          id_registro: id,
          details: payload,
        });
        return { success: "Cliente actualizado." };
    } catch (error: any) {
        return handleClienteError(error);
    }
}

export async function deleteCliente(id: number) {
  try {
    await apiCall(`/clientes/${id}/`, { method: 'DELETE' });
    revalidatePath('/clientes');
    await enviarAuditoria({
      accion: 'DELETE',
      tabla: 'clientes',
      id_registro: id,
      details: { message: `Cliente con id ${id} eliminado.` },
    });
    return { success: true };
  } catch (error) {
    return { error: "No se pudo eliminar el cliente. Es posible que tenga facturas asociadas." };
  }
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
    const newFactura = await apiCall('/facturas/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...header, monto_total: 0 }),
    });

    if (!newFactura || !newFactura.id_factura) {
      throw new Error("No se pudo crear la cabecera de la factura.");
    }

    const detallesPayload = {
      id_factura: newFactura.id_factura,
      productos: detalles,
    };

    await apiCall('/detalle_facturas/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(detallesPayload),
    });

    revalidatePath('/facturas');
    await enviarAuditoria({
      accion: 'CREATE',
      tabla: 'facturas',
      id_registro: newFactura.id_factura,
      details: { header, detalles },
    });
    return { success: true, newFacturaId: newFactura.id_factura };

  } catch (error) {
    console.error("Error al crear factura:", error);
    return { error: (error as Error).message || "Ocurrió un error al guardar la factura." };
  }
}


export async function deleteFactura(id: number) {
  try {
    await apiCall(`/facturas/${id}/`, { method: 'DELETE' });
    revalidatePath('/facturas');
     await enviarAuditoria({
      accion: 'DELETE',
      tabla: 'facturas',
      id_registro: id,
      details: { message: `Factura con id ${id} eliminada.` },
    });
    return { success: true };
  } catch (error) {
    return { error: "No se pudo eliminar la factura." };
  }
}

export async function updateFacturaStatusBatch(facturaIds: number[]) {
  if (facturaIds.length === 0) {
    return { success: true, updatedCount: 0 };
  }

  let updatedCount = 0;
  let hasErrors = false;

  for (const id of facturaIds) {
    try {
      const factura = await apiCall(`/facturas/${id}/`, { method: 'GET' });
      
      if (factura) {
        const { cliente, detalles, ...facturaPayload } = factura;
        const payload = { ...facturaPayload, estado_factura: 'Pagado' };
        
        await apiCall(`/facturas/${id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        await enviarAuditoria({
          accion: 'UPDATE',
          tabla: 'facturas',
          id_registro: id,
          details: { estado_factura: 'Pagado', trigger: 'Sync con Cuentas por Cobrar' },
        });
        updatedCount++;
      }
    } catch (error) {
      console.error(`Failed to update status for factura ${id}:`, error);
      hasErrors = true;
    }
  }

  if (updatedCount > 0) {
    revalidatePath('/facturas');
  }

  if (hasErrors) {
     return { error: "Algunas facturas no pudieron ser actualizadas.", updatedCount };
  }

  return { success: true, updatedCount };
}

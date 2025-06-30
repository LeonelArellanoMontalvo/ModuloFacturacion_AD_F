export interface TipoCliente {
  id_tipcli: number;
  nombre: string;
  monto_maximo: number;
}

export interface Cliente {
  id_cliente: number;
  id_tipo_cliente: number;
  nombre: string;
  apellido: string;
  direccion: string;
  telefono: string;
  correo_electronico: string;
  estado: string;
  tipo_identificacion: string;
  numero_identificacion: string;
  nombre_tipo_cliente?: string;
  tipo_cliente?: TipoCliente;
}

export interface Factura {
  id: number;
  id_cliente: number;
  numero_factura: string;
  fecha_emision: string;
  monto_total: number;
  tipo_pago: string;
  estado_factura: string;
  cliente?: Cliente;
  detalles?: DetalleFactura[];
}

export interface DetalleFactura {
  id: number;
  id_factura: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto?: Producto;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  estado: boolean;
}

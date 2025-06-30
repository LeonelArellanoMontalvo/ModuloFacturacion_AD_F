export interface TipoCliente {
  id_tipcli: number;
  nombre: string;
  monto_maximo: number;
}

export interface Cliente {
  id_cliente: number;
  tipo_cliente: number;
  nombre: string;
  apellido: string;
  direccion: string;
  telefono: string;
  correo_electronico: string;
  estado: string;
  tipo_identificacion: string;
  numero_identificacion: string;
  fecha_nacimiento: string;
  nombre_tipo_cliente?: string;
}

export interface Factura {
  id_factura: number;
  id_cliente: number;
  numero_factura: string;
  fecha_factura: string;
  monto_total: number;
  tipo_pago: string;
  estado_factura: string;
  cliente?: Cliente;
  detalles?: DetalleFactura[];
}

export interface DetalleFactura {
  id_detalle_factura: number;
  id_factura: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: string;
  subtotal: string;
  nombre: string;
}

export interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio: number; // Parsed from pvp for calculations
  pvp: string;
  estado: string;
}
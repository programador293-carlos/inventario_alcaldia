import { useCallback, useEffect, useState } from "react";

export type Organismo = "SVSH" | "FEV";
export type EstadoProducto = "bueno" | "regular" | "malo";
export type TipoEmpleado = "empleado" | "contratista";
export type TipoMovimiento =
  | "asignacion"
  | "traslado"
  | "devolucion"
  | "mantenimiento"
  | "baja";

export interface Sede {
  id: number;
  nombre_sede: string;
  direccion: string;
}

export interface OrganismoEntidad {
  id: number;
  sigla: string;
  nombre: string;
}

export interface Area {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface Empleado {
  id: number;
  nombre_completo: string;
  tipo: TipoEmpleado;
  sede_id: number;
  documento: string;
  email: string;
  activo: 0 | 1;
}

export interface TipoProducto {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface Producto {
  id: number;
  numero_serie: string;
  tipo_producto_id: number;
  descripcion: string;
  marca: string;
  modelo: string;
  usuario_responsable_id: number;
  usuario_actual_id: number;
  sede_id: number;
  organismo_id: number;
  area_id: number;
  ultimo_movimiento: string;
  estado: EstadoProducto;
  ram: string;
  disco_duro: string;
  procesador: string;
  observaciones: string;
}

export interface Movimiento {
  id: number;
  producto_id: number;
  tipo_movimiento: TipoMovimiento;
  empleado_origen_id: number;
  empleado_destino_id: number;
  sede_origen_id: number;
  sede_destino_id: number;
  observaciones_movimiento: string;
  fecha: string;
}

const PREFIJO = "inventario_v2_";

export const CLAVES = {
  sedes: PREFIJO + "sedes",
  organismos: PREFIJO + "organismos",
  areas: PREFIJO + "areas",
  empleados: PREFIJO + "empleados",
  tipos: PREFIJO + "tipos_producto",
  productos: PREFIJO + "productos",
  movimientos: PREFIJO + "movimientos",
} as const;

export const SEDES_INICIALES: Sede[] = [
  { id: 1, nombre_sede: "Sede Central", direccion: "Calle 10 # 5-32" },
  { id: 2, nombre_sede: "Sede Norte", direccion: "Av. Siempre Viva 120" },
  { id: 3, nombre_sede: "Bodega Sur", direccion: "Km 3 Vía Sur" },
];

export const ORGANISMOS_INICIALES: OrganismoEntidad[] = [
  { id: 1, sigla: "SVSH", nombre: "Secretaría de Vivienda Social y Hábitat" },
  { id: 2, sigla: "FEV", nombre: "Fondo Especial de Vivienda" },
];

export const AREAS_INICIALES: Area[] = [
  { id: 1, nombre: "Administrativa", descripcion: "Gestión administrativa" },
  { id: 2, nombre: "Operaciones", descripcion: "Operación y campo" },
  { id: 3, nombre: "Logística", descripcion: "Almacén y distribución" },
];


export const EMPLEADOS_INICIALES: Empleado[] = [
  {
    id: 1,
    nombre_completo: "Ana María Gómez",
    tipo: "empleado",
    sede_id: 1,
    documento: "1032456789",
    email: "ana.gomez@empresa.com",
    activo: 1,
  },
  {
    id: 2,
    nombre_completo: "Carlos Restrepo",
    tipo: "contratista",
    sede_id: 2,
    documento: "8001234",
    email: "carlos.restrepo@empresa.com",
    activo: 1,
  },
  {
    id: 3,
    nombre_completo: "Luisa Fernanda Páez",
    tipo: "empleado",
    sede_id: 3,
    documento: "52998877",
    email: "luisa.paez@empresa.com",
    activo: 1,
  },
  {
    id: 4,
    nombre_completo: "Jorge Martínez",
    tipo: "empleado",
    sede_id: 1,
    documento: "79665544",
    email: "jorge.martinez@empresa.com",
    activo: 0,
  },
];

export const TIPOS_INICIALES: TipoProducto[] = [
  { id: 1, nombre: "Portátil", descripcion: "Computador portátil de trabajo" },
  { id: 2, nombre: "Escritorio", descripcion: "Computador de escritorio" },
  { id: 3, nombre: "Impresora", descripcion: "Impresora multifuncional" },
  { id: 4, nombre: "Monitor", descripcion: "Pantalla externa" },
];

export const PRODUCTOS_INICIALES: Producto[] = [
  {
    id: 1,
    numero_serie: "SN-PC-0001",
    tipo_producto_id: 1,
    descripcion: "Portátil asignado a contabilidad",
    marca: "Lenovo",
    modelo: "ThinkPad T14",
    usuario_responsable_id: 1,
    usuario_actual_id: 1,
    sede_id: 1,
    organismo_id: 1,
    area_id: 1,
    ultimo_movimiento: "2026-02-10",
    estado: "bueno",
    ram: "16 GB",
    disco_duro: "512 GB SSD",
    procesador: "Intel Core i7 11va",
    observaciones: "Incluye base refrigerante",
  },
  {
    id: 2,
    numero_serie: "SN-PC-0002",
    tipo_producto_id: 2,
    descripcion: "Equipo de recepción",
    marca: "HP",
    modelo: "ProDesk 400",
    usuario_responsable_id: 2,
    usuario_actual_id: 2,
    sede_id: 2,
    organismo_id: 2,
    area_id: 2,
    ultimo_movimiento: "2026-03-01",
    estado: "regular",
    ram: "8 GB",
    disco_duro: "1 TB HDD",
    procesador: "Intel Core i5 10ma",
    observaciones: "Requiere cambio de disco a SSD",
  },
  {
    id: 3,
    numero_serie: "SN-IMP-0010",
    tipo_producto_id: 3,
    descripcion: "Impresora de bodega",
    marca: "Epson",
    modelo: "L3250",
    usuario_responsable_id: 3,
    usuario_actual_id: 3,
    sede_id: 3,
    organismo_id: 1,
    area_id: 3,
    ultimo_movimiento: "2026-01-18",
    estado: "malo",
    ram: "N/A",
    disco_duro: "N/A",
    procesador: "N/A",
    observaciones: "Cabezal con fallas de impresión",
  },
];

export const MOVIMIENTOS_INICIALES: Movimiento[] = [
  {
    id: 1,
    producto_id: 1,
    tipo_movimiento: "asignacion",
    empleado_origen_id: 0,
    empleado_destino_id: 1,
    sede_origen_id: 0,
    sede_destino_id: 1,
    observaciones_movimiento: "Entrega inicial del equipo",
    fecha: "2026-02-10",
  },
];

function leer<T>(clave: string, inicial: T[]): T[] {
  if (typeof window === "undefined") return inicial;
  try {
    const crudo = window.localStorage.getItem(clave);
    if (!crudo) {
      window.localStorage.setItem(clave, JSON.stringify(inicial));
      return inicial;
    }
    return JSON.parse(crudo) as T[];
  } catch {
    return inicial;
  }
}

const EVENTO = "inventario-actualizado";

export function useTablaLocal<T extends { id: number }>(
  clave: string,
  inicial: T[],
) {
  const [datos, setDatos] = useState<T[]>(inicial);
  const [listo, setListo] = useState(false);

  const recargar = useCallback(() => {
    setDatos(leer<T>(clave, inicial));
    setListo(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  useEffect(() => {
    recargar();
    const manejar = () => recargar();
    window.addEventListener(EVENTO, manejar);
    window.addEventListener("storage", manejar);
    return () => {
      window.removeEventListener(EVENTO, manejar);
      window.removeEventListener("storage", manejar);
    };
  }, [recargar]);

  const guardar = useCallback(
    (nuevos: T[]) => {
      window.localStorage.setItem(clave, JSON.stringify(nuevos));
      setDatos(nuevos);
      window.dispatchEvent(new Event(EVENTO));
    },
    [clave],
  );

  return { datos, guardar, listo };
}

export function siguienteId(filas: { id: number }[]) {
  return filas.reduce((max, f) => Math.max(max, f.id), 0) + 1;
}

export function hoy() {
  return new Date().toISOString().slice(0, 10);
}

export const ETIQUETAS_MOVIMIENTO: Record<TipoMovimiento, string> = {
  asignacion: "Asignación",
  traslado: "Traslado",
  devolucion: "Devolución",
  mantenimiento: "Mantenimiento",
  baja: "Baja",
};

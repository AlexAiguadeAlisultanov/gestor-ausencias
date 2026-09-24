// Tipos compartidos del motor de reglas. Nada de aquí depende de Express ni de la base
// de datos: son funciones puras para poder testearlas sin levantar nada.

export type TipoAusencia =
  | "vacaciones"
  | "asuntos_propios"
  | "medico"
  | "baja"
  | "formacion";

export type EstadoSolicitud = "pendiente" | "aprobada" | "rechazada" | "cancelada";

export type Jornada = "completa" | "manana" | "tarde";

/** Tipos que no descuentan del saldo de días asignados (bajas y médico). */
export const TIPOS_SIN_DESCUENTO: ReadonlySet<TipoAusencia> = new Set([
  "medico",
  "baja",
]);

export interface Festivo {
  fecha: string; // YYYY-MM-DD
  nombre: string;
  ambito: "nacional" | "cataluna";
}

export interface Solicitud {
  id: number;
  empleadoId: number;
  tipo: TipoAusencia;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string; // YYYY-MM-DD
  jornadaInicio: Jornada;
  jornadaFin: Jornada;
  diasLaborables: number;
  estado: EstadoSolicitud;
  comentarioResponsable: string | null;
  creadaEn: string;
}

export interface SaldoAnio {
  asignados: number;
  disfrutados: number;
  pendientes: number;
  disponibles: number;
}

export const TRANSICIONES_VALIDAS: Record<EstadoSolicitud, EstadoSolicitud[]> = {
  pendiente: ["aprobada", "rechazada", "cancelada"],
  aprobada: ["cancelada"],
  rechazada: [],
  cancelada: [],
};

export type Rol = "empleado" | "responsable" | "rrhh";
export type TipoAusencia = "vacaciones" | "asuntos_propios" | "medico" | "baja" | "formacion";
export type EstadoSolicitud = "pendiente" | "aprobada" | "rechazada" | "cancelada";
export type Jornada = "completa" | "manana" | "tarde";

export interface Empleado {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  equipoId: number | null;
  activo: boolean;
}

export interface Equipo {
  id: number;
  nombre: string;
  minimoCobertura: number;
}

export interface Festivo {
  id: number;
  fecha: string;
  nombre: string;
  ambito: "nacional" | "cataluna";
}

export interface Solicitud {
  id: number;
  empleadoId: number;
  tipo: TipoAusencia;
  fechaInicio: string;
  fechaFin: string;
  jornadaInicio: Jornada;
  jornadaFin: Jornada;
  diasLaborables: number;
  estado: EstadoSolicitud;
  comentarioResponsable: string | null;
  creadaEn: string;
  decididaEn: string | null;
  decididaPorId: number | null;
}

export interface SaldoTipo {
  tipo: TipoAusencia;
  saldo: {
    asignados: number;
    disfrutados: number;
    pendientes: number;
    disponibles: number;
  };
}

export interface DiaCobertura {
  fecha: string;
  fueraDelEquipo: number;
  totalEquipo: number;
  disponibles: number;
  bajoMinimo: boolean;
}

export interface ErrorAPI {
  error: string;
  mensaje: string;
}

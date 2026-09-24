export type Rol = "empleado" | "responsable" | "rrhh";

export interface FilaEmpleado {
  id: number;
  nombre: string;
  email: string;
  passwordHash: string;
  rol: Rol;
  equipoId: number | null;
  activo: number;
}

export interface FilaEquipo {
  id: number;
  nombre: string;
  minimoCobertura: number;
}

export interface FilaFestivo {
  id: number;
  fecha: string;
  nombre: string;
  ambito: "nacional" | "cataluna";
}

export interface FilaAsignacion {
  id: number;
  empleadoId: number;
  anio: number;
  tipo: string;
  dias: number;
}

export interface FilaSolicitud {
  id: number;
  empleadoId: number;
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
  jornadaInicio: string;
  jornadaFin: string;
  diasLaborables: number;
  estado: string;
  comentarioResponsable: string | null;
  creadaEn: string;
  decididaEn: string | null;
  decididaPorId: number | null;
}

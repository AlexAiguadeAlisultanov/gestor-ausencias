import type { FilaEmpleado, FilaEquipo, FilaFestivo, FilaSolicitud } from "./db/tipos.js";

export function empleadoPublico(e: FilaEmpleado) {
  return {
    id: e.id,
    nombre: e.nombre,
    email: e.email,
    rol: e.rol,
    equipoId: e.equipoId,
    activo: Boolean(e.activo),
  };
}

export function equipoPublico(e: FilaEquipo) {
  return { id: e.id, nombre: e.nombre, minimoCobertura: e.minimoCobertura };
}

export function festivoPublico(f: FilaFestivo) {
  return { id: f.id, fecha: f.fecha, nombre: f.nombre, ambito: f.ambito };
}

export function solicitudPublica(s: FilaSolicitud) {
  return {
    id: s.id,
    empleadoId: s.empleadoId,
    tipo: s.tipo,
    fechaInicio: s.fechaInicio,
    fechaFin: s.fechaFin,
    jornadaInicio: s.jornadaInicio,
    jornadaFin: s.jornadaFin,
    diasLaborables: s.diasLaborables,
    estado: s.estado,
    comentarioResponsable: s.comentarioResponsable,
    creadaEn: s.creadaEn,
    decididaEn: s.decididaEn,
    decididaPorId: s.decididaPorId,
  };
}

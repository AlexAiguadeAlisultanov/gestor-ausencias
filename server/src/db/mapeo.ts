import type { Solicitud } from "../engine/types.js";
import type { FilaSolicitud } from "./tipos.js";

/** Convierte una fila cruda de la base de datos al tipo tipado que espera el motor de reglas. */
export function aSolicitudEngine(f: FilaSolicitud): Solicitud {
  return {
    id: f.id,
    empleadoId: f.empleadoId,
    tipo: f.tipo as Solicitud["tipo"],
    fechaInicio: f.fechaInicio,
    fechaFin: f.fechaFin,
    jornadaInicio: f.jornadaInicio as Solicitud["jornadaInicio"],
    jornadaFin: f.jornadaFin as Solicitud["jornadaFin"],
    diasLaborables: f.diasLaborables,
    estado: f.estado as Solicitud["estado"],
    comentarioResponsable: f.comentarioResponsable,
    creadaEn: f.creadaEn,
  };
}

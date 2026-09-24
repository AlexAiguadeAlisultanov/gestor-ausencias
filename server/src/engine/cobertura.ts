import { rangoDeFechas } from "./diasLaborables.js";
import type { Solicitud } from "./types.js";

export interface AusenciaEnRango {
  empleadoId: number;
  fechaInicio: string;
  fechaFin: string;
}

export interface AvisoCoberturaDia {
  fecha: string;
  fueraDelEquipo: number;
  totalEquipo: number;
  disponibles: number;
  bajoMinimo: boolean;
}

/**
 * Para cada día del rango de la solicitud, cuenta cuánta gente del equipo (incluida la
 * solicitud que se está valorando) ya está fuera, y si eso deja al equipo por debajo del
 * mínimo de cobertura configurado.
 */
export function calcularCobertura(
  rango: { fechaInicio: string; fechaFin: string },
  totalEquipo: number,
  minimoCobertura: number,
  ausenciasAprobadas: AusenciaEnRango[],
): AvisoCoberturaDia[] {
  const dias = rangoDeFechas(rango.fechaInicio, rango.fechaFin);

  return dias.map((fecha) => {
    const empleadosFuera = new Set<number>();
    for (const a of ausenciasAprobadas) {
      const dentro = rangoDeFechas(a.fechaInicio, a.fechaFin).includes(fecha);
      if (dentro) empleadosFuera.add(a.empleadoId);
    }
    const fueraDelEquipo = empleadosFuera.size;
    const disponibles = Math.max(0, totalEquipo - fueraDelEquipo);
    return {
      fecha,
      fueraDelEquipo,
      totalEquipo,
      disponibles,
      bajoMinimo: disponibles < minimoCobertura,
    };
  });
}

export function filtrarAprobadasQueSolapanEquipo(
  solicitudes: Pick<Solicitud, "empleadoId" | "fechaInicio" | "fechaFin" | "estado">[],
): AusenciaEnRango[] {
  return solicitudes
    .filter((s) => s.estado === "aprobada")
    .map((s) => ({ empleadoId: s.empleadoId, fechaInicio: s.fechaInicio, fechaFin: s.fechaFin }));
}

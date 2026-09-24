import { seSolapan } from "./diasLaborables.js";
import {
  TIPOS_SIN_DESCUENTO,
  TRANSICIONES_VALIDAS,
  type EstadoSolicitud,
  type SaldoAnio,
  type Solicitud,
  type TipoAusencia,
} from "./types.js";

export class ErrorDeRegla extends Error {
  codigo: string;
  constructor(codigo: string, mensaje: string) {
    super(mensaje);
    this.codigo = codigo;
  }
}

/** Una solicitud nueva no puede solapar ninguna otra activa (pendiente o aprobada) del mismo empleado. */
export function comprobarSinSolape(
  nueva: { fechaInicio: string; fechaFin: string },
  existentes: Pick<Solicitud, "fechaInicio" | "fechaFin" | "estado">[],
): void {
  const activas = existentes.filter((s) => s.estado === "pendiente" || s.estado === "aprobada");
  const hayChoque = activas.some((s) =>
    seSolapan(nueva.fechaInicio, nueva.fechaFin, s.fechaInicio, s.fechaFin),
  );
  if (hayChoque) {
    throw new ErrorDeRegla(
      "solape",
      "Ya tienes una solicitud en esas fechas. Cancélala antes de pedir otra.",
    );
  }
}

/** Calcula el saldo del año a partir de los días asignados y las solicitudes existentes. */
export function calcularSaldo(diasAsignados: number, solicitudesDelAnio: Solicitud[]): SaldoAnio {
  let disfrutados = 0;
  let pendientes = 0;

  for (const s of solicitudesDelAnio) {
    if (TIPOS_SIN_DESCUENTO.has(s.tipo)) continue;
    if (s.estado === "aprobada") disfrutados += s.diasLaborables;
    else if (s.estado === "pendiente") pendientes += s.diasLaborables;
  }

  const disponibles = Math.max(0, diasAsignados - disfrutados - pendientes);
  return { asignados: diasAsignados, disfrutados, pendientes, disponibles };
}

/** Los tipos que sí descuentan no pueden pedir más días de los que quedan disponibles. */
export function comprobarSaldoSuficiente(
  tipo: TipoAusencia,
  diasSolicitados: number,
  saldo: SaldoAnio,
): void {
  if (TIPOS_SIN_DESCUENTO.has(tipo)) return;
  if (diasSolicitados > saldo.disponibles) {
    throw new ErrorDeRegla(
      "saldo_insuficiente",
      `Pides ${diasSolicitados} días y solo tienes ${saldo.disponibles} disponibles.`,
    );
  }
}

export function comprobarTransicion(actual: EstadoSolicitud, siguiente: EstadoSolicitud): void {
  const permitidas = TRANSICIONES_VALIDAS[actual];
  if (!permitidas.includes(siguiente)) {
    throw new ErrorDeRegla(
      "transicion_invalida",
      `Una solicitud en estado "${actual}" no puede pasar a "${siguiente}".`,
    );
  }
}

/** Un responsable no puede decidir sobre su propia solicitud. */
export function comprobarNoAutoaprobacion(empleadoIdSolicitud: number, decisorId: number): void {
  if (empleadoIdSolicitud === decisorId) {
    throw new ErrorDeRegla(
      "autoaprobacion",
      "No puedes aprobar o rechazar tu propia solicitud.",
    );
  }
}

/** Solo se puede cancelar una solicitud que todavía no ha empezado. */
export function comprobarNoEmpezada(fechaInicio: string, hoyISO: string): void {
  if (fechaInicio <= hoyISO) {
    throw new ErrorDeRegla(
      "ya_empezada",
      "Esta ausencia ya ha empezado, no se puede cancelar.",
    );
  }
}

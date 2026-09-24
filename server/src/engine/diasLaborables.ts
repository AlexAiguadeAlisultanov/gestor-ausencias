import type { Festivo, Jornada } from "./types.js";

/** Convierte "YYYY-MM-DD" a un Date en UTC a medianoche, para no arrastrar líos de zona horaria. */
function aFechaUTC(fecha: string): Date {
  const partes = fecha.split("-").map(Number);
  const anio = partes[0] ?? NaN;
  const mes = partes[1] ?? NaN;
  const dia = partes[2] ?? NaN;
  if (Number.isNaN(anio) || Number.isNaN(mes) || Number.isNaN(dia)) {
    throw new Error(`Fecha inválida: "${fecha}"`);
  }
  return new Date(Date.UTC(anio, mes - 1, dia));
}

function esFinDeSemana(fecha: Date): boolean {
  const dia = fecha.getUTCDay();
  return dia === 0 || dia === 6;
}

function formatearISO(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

/**
 * Cuenta los días laborables entre fechaInicio y fechaFin (ambas incluidas), descontando
 * fines de semana y festivos. Si la solicitud empieza o termina a media jornada, ese
 * extremo cuenta como 0.5 en vez de 1, siempre que ese día sea laborable.
 */
export function contarDiasLaborables(
  fechaInicio: string,
  fechaFin: string,
  festivos: Pick<Festivo, "fecha">[],
  jornadaInicio: Jornada = "completa",
  jornadaFin: Jornada = "completa",
): number {
  const inicio = aFechaUTC(fechaInicio);
  const fin = aFechaUTC(fechaFin);
  if (inicio.getTime() > fin.getTime()) {
    throw new Error("La fecha de inicio no puede ser posterior a la de fin");
  }

  const festivosSet = new Set(festivos.map((f) => f.fecha));
  let total = 0;
  const cursor = new Date(inicio);

  while (cursor.getTime() <= fin.getTime()) {
    const iso = formatearISO(cursor);
    if (!esFinDeSemana(cursor) && !festivosSet.has(iso)) {
      const esPrimerDia = cursor.getTime() === inicio.getTime();
      const esUltimoDia = cursor.getTime() === fin.getTime();
      let valor = 1;
      // Si el rango es un único día, se aplica la jornada más restrictiva de las dos.
      if (esPrimerDia && esUltimoDia) {
        if (jornadaInicio !== "completa" || jornadaFin !== "completa") valor = 0.5;
      } else if (esPrimerDia && jornadaInicio !== "completa") {
        valor = 0.5;
      } else if (esUltimoDia && jornadaFin !== "completa") {
        valor = 0.5;
      }
      total += valor;
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return total;
}

/** Da la lista de fechas ISO (un elemento por día natural) entre dos fechas, ambas incluidas. */
export function rangoDeFechas(fechaInicio: string, fechaFin: string): string[] {
  const inicio = aFechaUTC(fechaInicio);
  const fin = aFechaUTC(fechaFin);
  const fechas: string[] = [];
  const cursor = new Date(inicio);
  while (cursor.getTime() <= fin.getTime()) {
    fechas.push(formatearISO(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return fechas;
}

export function seSolapan(
  inicioA: string,
  finA: string,
  inicioB: string,
  finB: string,
): boolean {
  return aFechaUTC(inicioA).getTime() <= aFechaUTC(finB).getTime()
    && aFechaUTC(inicioB).getTime() <= aFechaUTC(finA).getTime();
}

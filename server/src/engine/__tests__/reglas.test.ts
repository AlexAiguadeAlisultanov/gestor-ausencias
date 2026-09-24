import { describe, expect, it } from "vitest";
import {
  ErrorDeRegla,
  calcularSaldo,
  comprobarNoAutoaprobacion,
  comprobarNoEmpezada,
  comprobarSaldoSuficiente,
  comprobarSinSolape,
  comprobarTransicion,
} from "../reglas.js";
import type { Solicitud } from "../types.js";

function solicitud(parcial: Partial<Solicitud>): Solicitud {
  return {
    id: 1,
    empleadoId: 1,
    tipo: "vacaciones",
    fechaInicio: "2026-10-01",
    fechaFin: "2026-10-05",
    jornadaInicio: "completa",
    jornadaFin: "completa",
    diasLaborables: 5,
    estado: "pendiente",
    comentarioResponsable: null,
    creadaEn: "2026-09-01T00:00:00.000Z",
    ...parcial,
  };
}

describe("comprobarSinSolape", () => {
  it("no lanza si no hay ninguna solicitud activa que choque", () => {
    expect(() =>
      comprobarSinSolape(
        { fechaInicio: "2026-11-01", fechaFin: "2026-11-05" },
        [solicitud({ estado: "cancelada" })],
      ),
    ).not.toThrow();
  });

  it("lanza si choca con una pendiente o aprobada", () => {
    expect(() =>
      comprobarSinSolape(
        { fechaInicio: "2026-10-03", fechaFin: "2026-10-10" },
        [solicitud({ estado: "aprobada" })],
      ),
    ).toThrow(ErrorDeRegla);
  });
});

describe("calcularSaldo", () => {
  it("descuenta disfrutados y pendientes, ignora las que no descuentan", () => {
    const saldo = calcularSaldo(23, [
      solicitud({ estado: "aprobada", diasLaborables: 5 }),
      solicitud({ estado: "pendiente", diasLaborables: 3 }),
      solicitud({ estado: "aprobada", tipo: "baja", diasLaborables: 10 }),
      solicitud({ estado: "rechazada", diasLaborables: 4 }),
    ]);
    expect(saldo).toEqual({ asignados: 23, disfrutados: 5, pendientes: 3, disponibles: 15 });
  });

  it("nunca da disponibles negativos", () => {
    const saldo = calcularSaldo(2, [solicitud({ estado: "aprobada", diasLaborables: 5 })]);
    expect(saldo.disponibles).toBe(0);
  });
});

describe("comprobarSaldoSuficiente", () => {
  it("deja pasar los tipos que no descuentan aunque no haya saldo", () => {
    expect(() =>
      comprobarSaldoSuficiente("medico", 100, {
        asignados: 0,
        disfrutados: 0,
        pendientes: 0,
        disponibles: 0,
      }),
    ).not.toThrow();
  });

  it("lanza si se piden más días de los disponibles", () => {
    expect(() =>
      comprobarSaldoSuficiente("vacaciones", 10, {
        asignados: 23,
        disfrutados: 20,
        pendientes: 0,
        disponibles: 3,
      }),
    ).toThrow(ErrorDeRegla);
  });
});

describe("comprobarTransicion", () => {
  it("permite pendiente -> aprobada", () => {
    expect(() => comprobarTransicion("pendiente", "aprobada")).not.toThrow();
  });

  it("permite aprobada -> cancelada", () => {
    expect(() => comprobarTransicion("aprobada", "cancelada")).not.toThrow();
  });

  it("rechaza rechazada -> aprobada", () => {
    expect(() => comprobarTransicion("rechazada", "aprobada")).toThrow(ErrorDeRegla);
  });

  it("rechaza cancelada -> pendiente", () => {
    expect(() => comprobarTransicion("cancelada", "pendiente")).toThrow(ErrorDeRegla);
  });
});

describe("comprobarNoAutoaprobacion", () => {
  it("lanza si el decisor es el propio empleado", () => {
    expect(() => comprobarNoAutoaprobacion(7, 7)).toThrow(ErrorDeRegla);
  });

  it("no lanza si son personas distintas", () => {
    expect(() => comprobarNoAutoaprobacion(7, 8)).not.toThrow();
  });
});

describe("comprobarNoEmpezada", () => {
  it("lanza si la fecha de inicio ya pasó o es hoy", () => {
    expect(() => comprobarNoEmpezada("2026-09-25", "2026-09-25")).toThrow(ErrorDeRegla);
  });

  it("no lanza si empieza en el futuro", () => {
    expect(() => comprobarNoEmpezada("2026-10-01", "2026-09-25")).not.toThrow();
  });
});

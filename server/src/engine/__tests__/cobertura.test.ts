import { describe, expect, it } from "vitest";
import { calcularCobertura } from "../cobertura.js";

describe("calcularCobertura", () => {
  it("cuenta cuánta gente del equipo está fuera cada día", () => {
    const resultado = calcularCobertura(
      { fechaInicio: "2026-10-01", fechaFin: "2026-10-02" },
      5,
      3,
      [
        { empleadoId: 1, fechaInicio: "2026-10-01", fechaFin: "2026-10-01" },
        { empleadoId: 2, fechaInicio: "2026-10-01", fechaFin: "2026-10-03" },
      ],
    );
    expect(resultado).toEqual([
      { fecha: "2026-10-01", fueraDelEquipo: 2, totalEquipo: 5, disponibles: 3, bajoMinimo: false },
      { fecha: "2026-10-02", fueraDelEquipo: 1, totalEquipo: 5, disponibles: 4, bajoMinimo: false },
    ]);
  });

  it("marca el día como bajo mínimo cuando la cobertura cae por debajo del umbral", () => {
    const resultado = calcularCobertura(
      { fechaInicio: "2026-10-01", fechaFin: "2026-10-01" },
      4,
      2,
      [
        { empleadoId: 1, fechaInicio: "2026-10-01", fechaFin: "2026-10-01" },
        { empleadoId: 2, fechaInicio: "2026-10-01", fechaFin: "2026-10-01" },
        { empleadoId: 3, fechaInicio: "2026-10-01", fechaFin: "2026-10-01" },
      ],
    );
    expect(resultado[0]?.disponibles).toBe(1);
    expect(resultado[0]?.bajoMinimo).toBe(true);
  });
});

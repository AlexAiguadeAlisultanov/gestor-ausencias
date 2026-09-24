import { describe, expect, it } from "vitest";
import { contarDiasLaborables, rangoDeFechas, seSolapan } from "../diasLaborables.js";

describe("contarDiasLaborables", () => {
  it("cuenta de lunes a viernes como 5 días", () => {
    // 2026-09-28 es lunes, 2026-10-02 es viernes
    expect(contarDiasLaborables("2026-09-28", "2026-10-02", [])).toBe(5);
  });

  it("excluye el fin de semana dentro del rango", () => {
    // lunes a lunes siguiente: 6 laborables (se salta sábado y domingo)
    expect(contarDiasLaborables("2026-09-28", "2026-10-05", [])).toBe(6);
  });

  it("excluye los festivos configurados", () => {
    expect(
      contarDiasLaborables("2026-09-28", "2026-10-02", [{ fecha: "2026-09-30" }]),
    ).toBe(4);
  });

  it("un solo día no laborable da cero", () => {
    // 2026-10-03 es sábado
    expect(contarDiasLaborables("2026-10-03", "2026-10-03", [])).toBe(0);
  });

  it("aplica media jornada al primer día", () => {
    expect(contarDiasLaborables("2026-09-28", "2026-09-29", [], "tarde", "completa")).toBe(1.5);
  });

  it("aplica media jornada al único día del rango", () => {
    expect(contarDiasLaborables("2026-09-28", "2026-09-28", [], "manana", "manana")).toBe(0.5);
  });

  it("rechaza rangos invertidos", () => {
    expect(() => contarDiasLaborables("2026-10-02", "2026-09-28", [])).toThrow();
  });
});

describe("seSolapan", () => {
  it("detecta solape parcial", () => {
    expect(seSolapan("2026-09-01", "2026-09-10", "2026-09-05", "2026-09-15")).toBe(true);
  });

  it("detecta que no hay solape cuando hay hueco", () => {
    expect(seSolapan("2026-09-01", "2026-09-05", "2026-09-06", "2026-09-10")).toBe(false);
  });

  it("detecta solape cuando una contiene a la otra", () => {
    expect(seSolapan("2026-09-01", "2026-09-30", "2026-09-10", "2026-09-12")).toBe(true);
  });
});

describe("rangoDeFechas", () => {
  it("devuelve un array con todas las fechas incluidas", () => {
    expect(rangoDeFechas("2026-09-28", "2026-09-30")).toEqual([
      "2026-09-28",
      "2026-09-29",
      "2026-09-30",
    ]);
  });
});

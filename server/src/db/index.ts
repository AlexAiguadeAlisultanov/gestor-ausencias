import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const RUTA_BD = process.env.RUTA_BD ?? "./data/ausencias.db";

function asegurarCarpeta(ruta: string) {
  const carpeta = dirname(ruta);
  if (carpeta && carpeta !== "." && !existsSync(carpeta)) {
    mkdirSync(carpeta, { recursive: true });
  }
}

if (RUTA_BD !== ":memory:") asegurarCarpeta(RUTA_BD);

export const db = new DatabaseSync(RUTA_BD);
db.exec("PRAGMA foreign_keys = ON;");
db.exec("PRAGMA journal_mode = WAL;");

const ESQUEMA = `
CREATE TABLE IF NOT EXISTS equipos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  minimoCobertura INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS empleados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('empleado', 'responsable', 'rrhh')),
  equipoId INTEGER REFERENCES equipos(id),
  activo INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS asignaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empleadoId INTEGER NOT NULL REFERENCES empleados(id),
  anio INTEGER NOT NULL,
  tipo TEXT NOT NULL,
  dias REAL NOT NULL,
  UNIQUE (empleadoId, anio, tipo)
);

CREATE TABLE IF NOT EXISTS festivos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  ambito TEXT NOT NULL CHECK (ambito IN ('nacional', 'cataluna'))
);

CREATE TABLE IF NOT EXISTS solicitudes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empleadoId INTEGER NOT NULL REFERENCES empleados(id),
  tipo TEXT NOT NULL,
  fechaInicio TEXT NOT NULL,
  fechaFin TEXT NOT NULL,
  jornadaInicio TEXT NOT NULL DEFAULT 'completa',
  jornadaFin TEXT NOT NULL DEFAULT 'completa',
  diasLaborables REAL NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  comentarioResponsable TEXT,
  creadaEn TEXT NOT NULL,
  decididaEn TEXT,
  decididaPorId INTEGER REFERENCES empleados(id)
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_empleado ON solicitudes(empleadoId);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes(estado);
CREATE INDEX IF NOT EXISTS idx_empleados_equipo ON empleados(equipoId);
`;

db.exec(ESQUEMA);

export function estaVacia(): boolean {
  const fila = db.prepare("SELECT COUNT(*) AS total FROM empleados").get() as { total: number };
  return fila.total === 0;
}

import { db } from "./index.js";
import type {
  FilaAsignacion,
  FilaEmpleado,
  FilaEquipo,
  FilaFestivo,
  FilaSolicitud,
} from "./tipos.js";

// --- Empleados -------------------------------------------------------------

export function obtenerEmpleadoPorId(id: number): FilaEmpleado | undefined {
  return db.prepare("SELECT * FROM empleados WHERE id = ?").get(id) as unknown as FilaEmpleado | undefined;
}

export function obtenerEmpleadoPorEmail(email: string): FilaEmpleado | undefined {
  return db
    .prepare("SELECT * FROM empleados WHERE email = ? COLLATE NOCASE")
    .get(email) as unknown as FilaEmpleado | undefined;
}

export function listarEmpleados(): FilaEmpleado[] {
  return db.prepare("SELECT * FROM empleados ORDER BY nombre").all() as unknown as FilaEmpleado[];
}

export function listarEmpleadosPorEquipo(equipoId: number): FilaEmpleado[] {
  return db
    .prepare("SELECT * FROM empleados WHERE equipoId = ? ORDER BY nombre")
    .all(equipoId) as unknown as FilaEmpleado[];
}

export function crearEmpleado(datos: {
  nombre: string;
  email: string;
  passwordHash: string;
  rol: string;
  equipoId: number | null;
}): number {
  const resultado = db
    .prepare(
      "INSERT INTO empleados (nombre, email, passwordHash, rol, equipoId) VALUES (?, ?, ?, ?, ?)",
    )
    .run(datos.nombre, datos.email, datos.passwordHash, datos.rol, datos.equipoId);
  return Number(resultado.lastInsertRowid);
}

export function actualizarEmpleado(
  id: number,
  datos: { nombre?: string; rol?: string; equipoId?: number | null; activo?: boolean },
): void {
  const actual = obtenerEmpleadoPorId(id);
  if (!actual) return;
  db.prepare(
    "UPDATE empleados SET nombre = ?, rol = ?, equipoId = ?, activo = ? WHERE id = ?",
  ).run(
    datos.nombre ?? actual.nombre,
    datos.rol ?? actual.rol,
    datos.equipoId !== undefined ? datos.equipoId : actual.equipoId,
    datos.activo !== undefined ? (datos.activo ? 1 : 0) : actual.activo,
    id,
  );
}

// --- Equipos -----------------------------------------------------------

export function listarEquipos(): FilaEquipo[] {
  return db.prepare("SELECT * FROM equipos ORDER BY nombre").all() as unknown as FilaEquipo[];
}

export function obtenerEquipoPorId(id: number): FilaEquipo | undefined {
  return db.prepare("SELECT * FROM equipos WHERE id = ?").get(id) as unknown as FilaEquipo | undefined;
}

export function crearEquipo(nombre: string, minimoCobertura: number): number {
  const resultado = db
    .prepare("INSERT INTO equipos (nombre, minimoCobertura) VALUES (?, ?)")
    .run(nombre, minimoCobertura);
  return Number(resultado.lastInsertRowid);
}

export function actualizarEquipo(id: number, nombre: string, minimoCobertura: number): void {
  db.prepare("UPDATE equipos SET nombre = ?, minimoCobertura = ? WHERE id = ?").run(
    nombre,
    minimoCobertura,
    id,
  );
}

// --- Festivos ------------------------------------------------------------

export function listarFestivos(): FilaFestivo[] {
  return db.prepare("SELECT * FROM festivos ORDER BY fecha").all() as unknown as FilaFestivo[];
}

export function listarFestivosEntre(desde: string, hasta: string): FilaFestivo[] {
  return db
    .prepare("SELECT * FROM festivos WHERE fecha BETWEEN ? AND ? ORDER BY fecha")
    .all(desde, hasta) as unknown as FilaFestivo[];
}

export function crearFestivo(fecha: string, nombre: string, ambito: string): number {
  const resultado = db
    .prepare("INSERT INTO festivos (fecha, nombre, ambito) VALUES (?, ?, ?)")
    .run(fecha, nombre, ambito);
  return Number(resultado.lastInsertRowid);
}

export function eliminarFestivo(id: number): void {
  db.prepare("DELETE FROM festivos WHERE id = ?").run(id);
}

// --- Asignaciones de días -------------------------------------------------

export function listarAsignacionesEmpleado(empleadoId: number, anio: number): FilaAsignacion[] {
  return db
    .prepare("SELECT * FROM asignaciones WHERE empleadoId = ? AND anio = ?")
    .all(empleadoId, anio) as unknown as FilaAsignacion[];
}

export function obtenerAsignacion(
  empleadoId: number,
  anio: number,
  tipo: string,
): FilaAsignacion | undefined {
  return db
    .prepare("SELECT * FROM asignaciones WHERE empleadoId = ? AND anio = ? AND tipo = ?")
    .get(empleadoId, anio, tipo) as unknown as FilaAsignacion | undefined;
}

export function fijarAsignacion(
  empleadoId: number,
  anio: number,
  tipo: string,
  dias: number,
): void {
  db.prepare(
    `INSERT INTO asignaciones (empleadoId, anio, tipo, dias) VALUES (?, ?, ?, ?)
     ON CONFLICT (empleadoId, anio, tipo) DO UPDATE SET dias = excluded.dias`,
  ).run(empleadoId, anio, tipo, dias);
}

// --- Solicitudes -----------------------------------------------------------

export function listarSolicitudesEmpleado(empleadoId: number): FilaSolicitud[] {
  return db
    .prepare("SELECT * FROM solicitudes WHERE empleadoId = ? ORDER BY fechaInicio DESC")
    .all(empleadoId) as unknown as FilaSolicitud[];
}

export function listarSolicitudesEmpleadoAnio(empleadoId: number, anio: number): FilaSolicitud[] {
  return db
    .prepare(
      "SELECT * FROM solicitudes WHERE empleadoId = ? AND substr(fechaInicio, 1, 4) = ? ORDER BY fechaInicio",
    )
    .all(empleadoId, String(anio)) as unknown as FilaSolicitud[];
}

export function obtenerSolicitud(id: number): FilaSolicitud | undefined {
  return db.prepare("SELECT * FROM solicitudes WHERE id = ?").get(id) as unknown as FilaSolicitud | undefined;
}

export function listarSolicitudesDeEquipo(equipoId: number): FilaSolicitud[] {
  return db
    .prepare(
      `SELECT s.* FROM solicitudes s
       JOIN empleados e ON e.id = s.empleadoId
       WHERE e.equipoId = ?
       ORDER BY s.fechaInicio DESC`,
    )
    .all(equipoId) as unknown as FilaSolicitud[];
}

export function listarSolicitudesPendientesDeEquipo(equipoId: number): FilaSolicitud[] {
  return db
    .prepare(
      `SELECT s.* FROM solicitudes s
       JOIN empleados e ON e.id = s.empleadoId
       WHERE e.equipoId = ? AND s.estado = 'pendiente'
       ORDER BY s.fechaInicio`,
    )
    .all(equipoId) as unknown as FilaSolicitud[];
}

export function listarSolicitudesAprobadasDeEquipoEnRango(
  equipoId: number,
  desde: string,
  hasta: string,
): FilaSolicitud[] {
  return db
    .prepare(
      `SELECT s.* FROM solicitudes s
       JOIN empleados e ON e.id = s.empleadoId
       WHERE e.equipoId = ? AND s.estado = 'aprobada'
         AND s.fechaInicio <= ? AND s.fechaFin >= ?
       ORDER BY s.fechaInicio`,
    )
    .all(equipoId, hasta, desde) as unknown as FilaSolicitud[];
}

export function listarSolicitudesEnRango(desde: string, hasta: string): FilaSolicitud[] {
  return db
    .prepare(
      `SELECT * FROM solicitudes WHERE fechaInicio <= ? AND fechaFin >= ? ORDER BY fechaInicio`,
    )
    .all(hasta, desde) as unknown as FilaSolicitud[];
}

export function crearSolicitud(datos: {
  empleadoId: number;
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
  jornadaInicio: string;
  jornadaFin: string;
  diasLaborables: number;
  creadaEn: string;
}): number {
  const resultado = db
    .prepare(
      `INSERT INTO solicitudes
        (empleadoId, tipo, fechaInicio, fechaFin, jornadaInicio, jornadaFin, diasLaborables, estado, creadaEn)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente', ?)`,
    )
    .run(
      datos.empleadoId,
      datos.tipo,
      datos.fechaInicio,
      datos.fechaFin,
      datos.jornadaInicio,
      datos.jornadaFin,
      datos.diasLaborables,
      datos.creadaEn,
    );
  return Number(resultado.lastInsertRowid);
}

export function actualizarEstadoSolicitud(
  id: number,
  estado: string,
  comentario: string | null,
  decididaPorId: number | null,
  decididaEn: string | null,
): void {
  db.prepare(
    `UPDATE solicitudes
     SET estado = ?, comentarioResponsable = ?, decididaPorId = ?, decididaEn = ?
     WHERE id = ?`,
  ).run(estado, comentario, decididaPorId, decididaEn, id);
}

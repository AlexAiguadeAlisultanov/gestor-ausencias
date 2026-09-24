import { Router } from "express";
import { requiereRol, requiereSesion } from "../auth/middleware.js";
import { hashPassword } from "../auth/password.js";
import {
  actualizarEmpleado,
  actualizarEquipo,
  crearEmpleado,
  crearEquipo,
  crearFestivo,
  eliminarFestivo,
  fijarAsignacion,
  listarAsignacionesEmpleado,
  listarEmpleados,
  listarEquipos,
  listarFestivos,
  listarSolicitudesEnRango,
  obtenerEmpleadoPorEmail,
  obtenerEmpleadoPorId,
} from "../db/repositorio.js";
import { empleadoPublico, equipoPublico, festivoPublico } from "../serializacion.js";
import {
  esquemaActualizarEmpleado,
  esquemaAsignacion,
  esquemaEquipo,
  esquemaFestivo,
  esquemaNuevoEmpleado,
  esquemaRangoExport,
} from "../validacion.js";

export const rutasAdmin = Router();

rutasAdmin.use(requiereSesion, requiereRol("rrhh"));

// --- Empleados -------------------------------------------------------------

rutasAdmin.get("/empleados", (_req, res) => {
  res.json({ empleados: listarEmpleados().map(empleadoPublico) });
});

rutasAdmin.post("/empleados", (req, res) => {
  const cuerpo = esquemaNuevoEmpleado.safeParse(req.body);
  if (!cuerpo.success) {
    res.status(400).json({ error: "datos_invalidos", mensaje: "Revisa los datos del empleado." });
    return;
  }
  if (obtenerEmpleadoPorEmail(cuerpo.data.email)) {
    res.status(409).json({ error: "email_en_uso", mensaje: "Ya hay una cuenta con ese correo." });
    return;
  }
  const id = crearEmpleado({
    nombre: cuerpo.data.nombre,
    email: cuerpo.data.email,
    passwordHash: hashPassword(cuerpo.data.password),
    rol: cuerpo.data.rol,
    equipoId: cuerpo.data.equipoId,
  });
  const anio = new Date().getUTCFullYear();
  for (const tipo of ["vacaciones", "asuntos_propios", "formacion"] as const) {
    fijarAsignacion(id, anio, tipo, tipo === "vacaciones" ? 23 : tipo === "asuntos_propios" ? 6 : 5);
  }
  res.status(201).json({ empleado: empleadoPublico(obtenerEmpleadoPorId(id)!) });
});

rutasAdmin.patch("/empleados/:id", (req, res) => {
  const cuerpo = esquemaActualizarEmpleado.safeParse(req.body);
  if (!cuerpo.success) {
    res.status(400).json({ error: "datos_invalidos", mensaje: "Revisa los datos del empleado." });
    return;
  }
  const empleado = obtenerEmpleadoPorId(Number(req.params.id));
  if (!empleado) {
    res.status(404).json({ error: "no_encontrado", mensaje: "Ese empleado no existe." });
    return;
  }
  actualizarEmpleado(empleado.id, cuerpo.data);
  res.json({ empleado: empleadoPublico(obtenerEmpleadoPorId(empleado.id)!) });
});

// --- Equipos -----------------------------------------------------------

rutasAdmin.get("/equipos", (_req, res) => {
  res.json({ equipos: listarEquipos().map(equipoPublico) });
});

rutasAdmin.post("/equipos", (req, res) => {
  const cuerpo = esquemaEquipo.safeParse(req.body);
  if (!cuerpo.success) {
    res.status(400).json({ error: "datos_invalidos", mensaje: "Indica nombre y mínimo de cobertura." });
    return;
  }
  const id = crearEquipo(cuerpo.data.nombre, cuerpo.data.minimoCobertura);
  res.status(201).json({ equipo: { id, nombre: cuerpo.data.nombre, minimoCobertura: cuerpo.data.minimoCobertura } });
});

rutasAdmin.patch("/equipos/:id", (req, res) => {
  const cuerpo = esquemaEquipo.safeParse(req.body);
  if (!cuerpo.success) {
    res.status(400).json({ error: "datos_invalidos", mensaje: "Indica nombre y mínimo de cobertura." });
    return;
  }
  actualizarEquipo(Number(req.params.id), cuerpo.data.nombre, cuerpo.data.minimoCobertura);
  res.json({ equipo: { id: Number(req.params.id), ...cuerpo.data } });
});

// --- Festivos ------------------------------------------------------------

rutasAdmin.get("/festivos", (_req, res) => {
  res.json({ festivos: listarFestivos().map(festivoPublico) });
});

rutasAdmin.post("/festivos", (req, res) => {
  const cuerpo = esquemaFestivo.safeParse(req.body);
  if (!cuerpo.success) {
    res.status(400).json({ error: "datos_invalidos", mensaje: "Revisa la fecha, el nombre y el ámbito." });
    return;
  }
  const id = crearFestivo(cuerpo.data.fecha, cuerpo.data.nombre, cuerpo.data.ambito);
  res.status(201).json({ festivo: { id, ...cuerpo.data } });
});

rutasAdmin.delete("/festivos/:id", (req, res) => {
  eliminarFestivo(Number(req.params.id));
  res.status(204).end();
});

// --- Asignaciones de días -------------------------------------------------

rutasAdmin.get("/asignaciones/:empleadoId", (req, res) => {
  const anio = req.query.anio ? Number(req.query.anio) : new Date().getUTCFullYear();
  const asignaciones = listarAsignacionesEmpleado(Number(req.params.empleadoId), anio);
  res.json({ asignaciones });
});

rutasAdmin.post("/asignaciones", (req, res) => {
  const cuerpo = esquemaAsignacion.safeParse(req.body);
  if (!cuerpo.success) {
    res.status(400).json({ error: "datos_invalidos", mensaje: "Revisa empleado, año, tipo y días." });
    return;
  }
  fijarAsignacion(cuerpo.data.empleadoId, cuerpo.data.anio, cuerpo.data.tipo, cuerpo.data.dias);
  res.status(200).json({ ok: true });
});

// --- Exportación CSV -------------------------------------------------------

const CABECERA_CSV = "id,empleado,email,equipo,tipo,fecha_inicio,fecha_fin,dias_laborables,estado,comentario";

function celdaCSV(valor: string | number | null): string {
  const texto = valor === null ? "" : String(valor);
  if (/[",\n]/.test(texto)) return `"${texto.replace(/"/g, '""')}"`;
  return texto;
}

rutasAdmin.get("/exportar", (req, res) => {
  const cuerpo = esquemaRangoExport.safeParse(req.query);
  if (!cuerpo.success) {
    res.status(400).json({ error: "datos_invalidos", mensaje: "Indica desde y hasta en formato AAAA-MM-DD." });
    return;
  }
  const solicitudes = listarSolicitudesEnRango(cuerpo.data.desde, cuerpo.data.hasta);
  const empleados = new Map(listarEmpleados().map((e) => [e.id, e]));
  const equipos = new Map(listarEquipos().map((e) => [e.id, e]));

  const filas = solicitudes.map((s) => {
    const empleado = empleados.get(s.empleadoId);
    const equipo = empleado?.equipoId ? equipos.get(empleado.equipoId) : undefined;
    return [
      s.id,
      empleado?.nombre ?? "",
      empleado?.email ?? "",
      equipo?.nombre ?? "",
      s.tipo,
      s.fechaInicio,
      s.fechaFin,
      s.diasLaborables,
      s.estado,
      s.comentarioResponsable ?? "",
    ]
      .map(celdaCSV)
      .join(",");
  });

  const csv = [CABECERA_CSV, ...filas].join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="ausencias_${cuerpo.data.desde}_${cuerpo.data.hasta}.csv"`,
  );
  res.send(`﻿${csv}`);
});

import { Router } from "express";
import { requiereRol, requiereSesion } from "../auth/middleware.js";
import { calcularCobertura, filtrarAprobadasQueSolapanEquipo } from "../engine/cobertura.js";
import {
  comprobarNoAutoaprobacion,
  comprobarTransicion,
  ErrorDeRegla,
} from "../engine/reglas.js";
import type { Solicitud } from "../engine/types.js";
import { aSolicitudEngine } from "../db/mapeo.js";
import {
  actualizarEstadoSolicitud,
  listarEmpleadosPorEquipo,
  listarSolicitudesDeEquipo,
  listarSolicitudesPendientesDeEquipo,
  obtenerEquipoPorId,
  obtenerSolicitud,
} from "../db/repositorio.js";
import { empleadoPublico, solicitudPublica } from "../serializacion.js";
import { esquemaDecision } from "../validacion.js";
import type { Request, Response } from "express";

export const rutasEquipo = Router();

rutasEquipo.use(requiereSesion, requiereRol("responsable", "rrhh"));

/** El responsable solo ve su equipo. RRHH puede pedir el de cualquiera con ?equipoId=. */
function resolverEquipoId(req: Request, res: Response): number | null {
  if (req.empleado!.rol === "responsable") {
    if (!req.empleado!.equipoId) {
      res.status(400).json({ error: "sin_equipo", mensaje: "No tienes un equipo asignado." });
      return null;
    }
    return req.empleado!.equipoId;
  }
  const equipoId = Number(req.query.equipoId);
  if (!equipoId) {
    res.status(400).json({ error: "falta_equipo", mensaje: "Indica qué equipo quieres consultar." });
    return null;
  }
  return equipoId;
}

rutasEquipo.get("/miembros", (req, res) => {
  const equipoId = resolverEquipoId(req, res);
  if (equipoId === null) return;
  const equipo = obtenerEquipoPorId(equipoId);
  if (!equipo) {
    res.status(404).json({ error: "no_encontrado", mensaje: "Ese equipo no existe." });
    return;
  }
  const miembros = listarEmpleadosPorEquipo(equipoId).map(empleadoPublico);
  res.json({ equipo: { id: equipo.id, nombre: equipo.nombre, minimoCobertura: equipo.minimoCobertura }, miembros });
});

rutasEquipo.get("/pendientes", (req, res) => {
  const equipoId = resolverEquipoId(req, res);
  if (equipoId === null) return;
  const pendientes = listarSolicitudesPendientesDeEquipo(equipoId).filter(
    (s) => s.empleadoId !== req.empleado!.id,
  );
  res.json({ solicitudes: pendientes.map(solicitudPublica) });
});

rutasEquipo.get("/calendario", (req, res) => {
  const equipoId = resolverEquipoId(req, res);
  if (equipoId === null) return;
  const desde = String(req.query.desde ?? "");
  const hasta = String(req.query.hasta ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(desde) || !/^\d{4}-\d{2}-\d{2}$/.test(hasta)) {
    res.status(400).json({ error: "rango_invalido", mensaje: "Indica desde y hasta en formato AAAA-MM-DD." });
    return;
  }
  const miembros = listarEmpleadosPorEquipo(equipoId).map(empleadoPublico);
  const solicitudes = listarSolicitudesDeEquipo(equipoId).filter(
    (s) => s.fechaInicio <= hasta && s.fechaFin >= desde && s.estado !== "cancelada" && s.estado !== "rechazada",
  );
  res.json({ miembros, solicitudes: solicitudes.map(solicitudPublica) });
});

rutasEquipo.get("/solicitudes/:id/cobertura", (req, res) => {
  const equipoId = resolverEquipoId(req, res);
  if (equipoId === null) return;
  const solicitud = obtenerSolicitud(Number(req.params.id));
  if (!solicitud) {
    res.status(404).json({ error: "no_encontrada", mensaje: "Esa solicitud no existe." });
    return;
  }
  const equipo = obtenerEquipoPorId(equipoId)!;
  const miembros = listarEmpleadosPorEquipo(equipoId);
  const aprobadas = filtrarAprobadasQueSolapanEquipo(
    listarSolicitudesDeEquipo(equipoId).filter((s) => s.id !== solicitud.id).map(aSolicitudEngine),
  );
  const cobertura = calcularCobertura(
    { fechaInicio: solicitud.fechaInicio, fechaFin: solicitud.fechaFin },
    miembros.length,
    equipo.minimoCobertura,
    aprobadas,
  );
  res.json({ cobertura });
});

rutasEquipo.post("/solicitudes/:id/decision", (req, res) => {
  const equipoId = resolverEquipoId(req, res);
  if (equipoId === null) return;

  const cuerpo = esquemaDecision.safeParse(req.body);
  if (!cuerpo.success) {
    res.status(400).json({ error: "datos_invalidos", mensaje: "Indica si apruebas o rechazas." });
    return;
  }

  const solicitud = obtenerSolicitud(Number(req.params.id));
  if (!solicitud) {
    res.status(404).json({ error: "no_encontrada", mensaje: "Esa solicitud no existe." });
    return;
  }

  const miembro = listarEmpleadosPorEquipo(equipoId).find((m) => m.id === solicitud.empleadoId);
  if (!miembro && req.empleado!.rol !== "rrhh") {
    res.status(403).json({ error: "sin_permiso", mensaje: "Esa persona no es de tu equipo." });
    return;
  }

  try {
    comprobarNoAutoaprobacion(solicitud.empleadoId, req.empleado!.id);
    comprobarTransicion(solicitud.estado as Solicitud["estado"], cuerpo.data.decision);
    actualizarEstadoSolicitud(
      solicitud.id,
      cuerpo.data.decision,
      cuerpo.data.comentario ?? null,
      req.empleado!.id,
      new Date().toISOString(),
    );
    res.json({ solicitud: solicitudPublica(obtenerSolicitud(solicitud.id)!) });
  } catch (error) {
    if (error instanceof ErrorDeRegla) {
      res.status(409).json({ error: error.codigo, mensaje: error.message });
      return;
    }
    throw error;
  }
});

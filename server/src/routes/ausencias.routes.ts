import { Router } from "express";
import { requiereSesion } from "../auth/middleware.js";
import { contarDiasLaborables } from "../engine/diasLaborables.js";
import { calcularSaldo, comprobarNoEmpezada, comprobarSaldoSuficiente, comprobarSinSolape, comprobarTransicion, ErrorDeRegla } from "../engine/reglas.js";
import {
  crearSolicitud,
  listarAsignacionesEmpleado,
  listarFestivos,
  listarSolicitudesEmpleado,
  listarSolicitudesEmpleadoAnio,
  actualizarEstadoSolicitud,
  obtenerSolicitud,
} from "../db/repositorio.js";
import { aSolicitudEngine } from "../db/mapeo.js";
import { solicitudPublica } from "../serializacion.js";
import { esquemaNuevaSolicitud } from "../validacion.js";
import type { Solicitud } from "../engine/types.js";

export const rutasAusencias = Router();

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

rutasAusencias.use(requiereSesion);

rutasAusencias.get("/", (req, res) => {
  const solicitudes = listarSolicitudesEmpleado(req.empleado!.id);
  res.json({ solicitudes: solicitudes.map(solicitudPublica) });
});

rutasAusencias.get("/saldo", (req, res) => {
  const anio = req.query.anio ? Number(req.query.anio) : new Date().getUTCFullYear();
  const asignaciones = listarAsignacionesEmpleado(req.empleado!.id, anio);
  const solicitudesAnio = listarSolicitudesEmpleadoAnio(req.empleado!.id, anio).map(aSolicitudEngine);

  const saldos = asignaciones.map((a) => ({
    tipo: a.tipo,
    saldo: calcularSaldo(
      a.dias,
      solicitudesAnio.filter((s) => s.tipo === a.tipo),
    ),
  }));

  res.json({ anio, saldos });
});

rutasAusencias.post("/", (req, res) => {
  const cuerpo = esquemaNuevaSolicitud.safeParse(req.body);
  if (!cuerpo.success) {
    res.status(400).json({ error: "datos_invalidos", mensaje: "Revisa el tipo y las fechas." });
    return;
  }
  const { tipo, fechaInicio, fechaFin, jornadaInicio, jornadaFin } = cuerpo.data;

  if (fechaInicio > fechaFin) {
    res.status(400).json({ error: "rango_invalido", mensaje: "La fecha de inicio es posterior a la de fin." });
    return;
  }

  const festivos = listarFestivos();
  const diasLaborables = contarDiasLaborables(fechaInicio, fechaFin, festivos, jornadaInicio, jornadaFin);

  if (diasLaborables === 0) {
    res.status(400).json({ error: "rango_sin_dias", mensaje: "Ese rango no tiene ningún día laborable." });
    return;
  }

  try {
    const existentes = listarSolicitudesEmpleado(req.empleado!.id).map(aSolicitudEngine);
    comprobarSinSolape({ fechaInicio, fechaFin }, existentes);

    const anio = Number(fechaInicio.slice(0, 4));
    const asignacion = listarAsignacionesEmpleado(req.empleado!.id, anio).find((a) => a.tipo === tipo);
    if (asignacion) {
      const solicitudesAnio = listarSolicitudesEmpleadoAnio(req.empleado!.id, anio)
        .map(aSolicitudEngine)
        .filter((s) => s.tipo === tipo);
      const saldo = calcularSaldo(asignacion.dias, solicitudesAnio);
      comprobarSaldoSuficiente(tipo, diasLaborables, saldo);
    }

    const id = crearSolicitud({
      empleadoId: req.empleado!.id,
      tipo,
      fechaInicio,
      fechaFin,
      jornadaInicio,
      jornadaFin,
      diasLaborables,
      creadaEn: new Date().toISOString(),
    });

    res.status(201).json({ solicitud: solicitudPublica(obtenerSolicitud(id)!) });
  } catch (error) {
    if (error instanceof ErrorDeRegla) {
      res.status(409).json({ error: error.codigo, mensaje: error.message });
      return;
    }
    throw error;
  }
});

rutasAusencias.post("/:id/cancelar", (req, res) => {
  const id = Number(req.params.id);
  const solicitud = obtenerSolicitud(id);
  if (!solicitud || solicitud.empleadoId !== req.empleado!.id) {
    res.status(404).json({ error: "no_encontrada", mensaje: "Esa solicitud no existe." });
    return;
  }

  try {
    comprobarTransicion(solicitud.estado as Solicitud["estado"], "cancelada");
    comprobarNoEmpezada(solicitud.fechaInicio, hoyISO());
    actualizarEstadoSolicitud(id, "cancelada", solicitud.comentarioResponsable, null, new Date().toISOString());
    res.json({ solicitud: solicitudPublica(obtenerSolicitud(id)!) });
  } catch (error) {
    if (error instanceof ErrorDeRegla) {
      res.status(409).json({ error: error.codigo, mensaje: error.message });
      return;
    }
    throw error;
  }
});

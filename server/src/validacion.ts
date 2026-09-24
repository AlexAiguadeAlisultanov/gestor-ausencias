import { z } from "zod";

const fechaISO = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

export const esquemaLogin = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const esquemaNuevaSolicitud = z.object({
  tipo: z.enum(["vacaciones", "asuntos_propios", "medico", "baja", "formacion"]),
  fechaInicio: fechaISO,
  fechaFin: fechaISO,
  jornadaInicio: z.enum(["completa", "manana", "tarde"]).default("completa"),
  jornadaFin: z.enum(["completa", "manana", "tarde"]).default("completa"),
});

export const esquemaDecision = z.object({
  decision: z.enum(["aprobada", "rechazada"]),
  comentario: z.string().max(500).optional(),
});

export const esquemaFestivo = z.object({
  fecha: fechaISO,
  nombre: z.string().min(1).max(120),
  ambito: z.enum(["nacional", "cataluna"]),
});

export const esquemaAsignacion = z.object({
  empleadoId: z.number().int().positive(),
  anio: z.number().int().min(2020).max(2100),
  tipo: z.enum(["vacaciones", "asuntos_propios", "formacion"]),
  dias: z.number().min(0).max(365),
});

export const esquemaNuevoEmpleado = z.object({
  nombre: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(200),
  rol: z.enum(["empleado", "responsable", "rrhh"]),
  equipoId: z.number().int().positive().nullable(),
});

export const esquemaActualizarEmpleado = z.object({
  nombre: z.string().min(1).max(120).optional(),
  rol: z.enum(["empleado", "responsable", "rrhh"]).optional(),
  equipoId: z.number().int().positive().nullable().optional(),
  activo: z.boolean().optional(),
});

export const esquemaEquipo = z.object({
  nombre: z.string().min(1).max(120),
  minimoCobertura: z.number().int().min(0).max(100),
});

export const esquemaRangoExport = z.object({
  desde: fechaISO,
  hasta: fechaISO,
});

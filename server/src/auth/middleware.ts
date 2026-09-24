import type { NextFunction, Request, Response } from "express";
import { obtenerEmpleadoPorId } from "../db/repositorio.js";
import type { FilaEmpleado, Rol } from "../db/tipos.js";
import { obtenerEmpleadoIdDeSesion } from "./session.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      empleado?: FilaEmpleado;
    }
  }
}

export function requiereSesion(req: Request, res: Response, next: NextFunction): void {
  const empleadoId = obtenerEmpleadoIdDeSesion(req);
  if (empleadoId === null) {
    res.status(401).json({ error: "no_autenticado", mensaje: "Inicia sesión para continuar." });
    return;
  }
  const empleado = obtenerEmpleadoPorId(empleadoId);
  if (!empleado || !empleado.activo) {
    res.status(401).json({ error: "no_autenticado", mensaje: "Inicia sesión para continuar." });
    return;
  }
  req.empleado = empleado;
  next();
}

export function requiereRol(...roles: Rol[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.empleado || !roles.includes(req.empleado.rol as Rol)) {
      res.status(403).json({ error: "sin_permiso", mensaje: "No tienes permiso para esto." });
      return;
    }
    next();
  };
}

import { Router } from "express";
import { verificarPassword } from "../auth/password.js";
import { requiereSesion } from "../auth/middleware.js";
import { crearSesion, destruirSesion } from "../auth/session.js";
import { obtenerEmpleadoPorEmail } from "../db/repositorio.js";
import { esquemaLogin } from "../validacion.js";
import { empleadoPublico } from "../serializacion.js";

export const rutasAuth = Router();

rutasAuth.post("/login", (req, res) => {
  const cuerpo = esquemaLogin.safeParse(req.body);
  if (!cuerpo.success) {
    res.status(400).json({ error: "datos_invalidos", mensaje: "Revisa el correo y la contraseña." });
    return;
  }

  const empleado = obtenerEmpleadoPorEmail(cuerpo.data.email);
  if (!empleado || !empleado.activo || !verificarPassword(cuerpo.data.password, empleado.passwordHash)) {
    res.status(401).json({ error: "credenciales_invalidas", mensaje: "Correo o contraseña incorrectos." });
    return;
  }

  crearSesion(res, empleado.id);
  res.json({ empleado: empleadoPublico(empleado) });
});

rutasAuth.post("/logout", (_req, res) => {
  destruirSesion(res);
  res.status(204).end();
});

rutasAuth.get("/yo", requiereSesion, (req, res) => {
  res.json({ empleado: empleadoPublico(req.empleado!) });
});

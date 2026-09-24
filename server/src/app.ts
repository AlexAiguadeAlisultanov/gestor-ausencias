import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rutasAdmin } from "./routes/admin.routes.js";
import { rutasAusencias } from "./routes/ausencias.routes.js";
import { rutasAuth } from "./routes/auth.routes.js";
import { rutasEquipo } from "./routes/equipo.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CARPETA_WEB = path.resolve(__dirname, "../../web/dist");

export function crearApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json());

  app.use("/api/auth", rutasAuth);
  app.use("/api/ausencias", rutasAusencias);
  app.use("/api/equipo", rutasEquipo);
  app.use("/api/admin", rutasAdmin);

  if (existsSync(CARPETA_WEB)) {
    app.use(express.static(CARPETA_WEB));
    app.get(/^(?!\/api\/).*/, (_req, res) => {
      res.sendFile(path.join(CARPETA_WEB, "index.html"));
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(error);
    res.status(500).json({ error: "error_interno", mensaje: "Algo ha ido mal en el servidor." });
  });

  return app;
}

import { crearApp } from "./app.js";
import { estaVacia } from "./db/index.js";
import { sembrar } from "./db/seed.js";

if (estaVacia()) {
  console.log("Base de datos vacía: sembrando datos de ejemplo...");
  sembrar();
  console.log("Datos de ejemplo listos.");
}

const PUERTO = Number(process.env.PORT) || 8002;
const app = crearApp();

app.listen(PUERTO, () => {
  console.log(`Gestor de Ausencias escuchando en el puerto ${PUERTO}`);
});

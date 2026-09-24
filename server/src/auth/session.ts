import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";

const NOMBRE_COOKIE = "sesion_ausencias";
const DURACION_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

const SECRETO = process.env.SESSION_SECRET ?? "secreto-de-desarrollo-cambia-esto";
if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  throw new Error("Falta SESSION_SECRET en producción");
}

interface CargaSesion {
  empleadoId: number;
  expiraEn: number;
}

function firmar(valor: string): string {
  return createHmac("sha256", SECRETO).update(valor).digest("hex");
}

function codificar(carga: CargaSesion): string {
  const json = Buffer.from(JSON.stringify(carga)).toString("base64url");
  const firma = firmar(json);
  return `${json}.${firma}`;
}

function decodificar(cookie: string): CargaSesion | null {
  const [json, firma] = cookie.split(".");
  if (!json || !firma) return null;
  const firmaEsperada = firmar(json);
  const bufA = Buffer.from(firma);
  const bufB = Buffer.from(firmaEsperada);
  if (bufA.length !== bufB.length || !timingSafeEqual(bufA, bufB)) return null;
  try {
    const carga = JSON.parse(Buffer.from(json, "base64url").toString("utf8")) as CargaSesion;
    if (typeof carga.empleadoId !== "number" || typeof carga.expiraEn !== "number") return null;
    if (carga.expiraEn < Date.now()) return null;
    return carga;
  } catch {
    return null;
  }
}

/** Parseo manual de la cabecera Cookie, sin depender de un paquete externo. */
export function leerCookies(req: Request): Record<string, string> {
  const cabecera = req.headers.cookie;
  const cookies: Record<string, string> = {};
  if (!cabecera) return cookies;
  for (const parte of cabecera.split(";")) {
    const indice = parte.indexOf("=");
    if (indice === -1) continue;
    const clave = parte.slice(0, indice).trim();
    const valor = parte.slice(indice + 1).trim();
    cookies[clave] = decodeURIComponent(valor);
  }
  return cookies;
}

export function crearSesion(res: Response, empleadoId: number): void {
  const carga: CargaSesion = { empleadoId, expiraEn: Date.now() + DURACION_MS };
  const valor = codificar(carga);
  const atributos = [
    `${NOMBRE_COOKIE}=${encodeURIComponent(valor)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.floor(DURACION_MS / 1000)}`,
  ];
  if (process.env.NODE_ENV === "production") atributos.push("Secure");
  res.setHeader("Set-Cookie", atributos.join("; "));
}

export function destruirSesion(res: Response): void {
  const atributos = [
    `${NOMBRE_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  res.setHeader("Set-Cookie", atributos.join("; "));
}

export function obtenerEmpleadoIdDeSesion(req: Request): number | null {
  const cookies = leerCookies(req);
  const valor = cookies[NOMBRE_COOKIE];
  if (!valor) return null;
  const carga = decodificar(valor);
  return carga ? carga.empleadoId : null;
}

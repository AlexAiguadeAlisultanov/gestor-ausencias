import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const LONGITUD_CLAVE = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, LONGITUD_CLAVE).toString("hex");
  return `${salt}:${hash}`;
}

export function verificarPassword(password: string, almacenado: string): boolean {
  const [salt, hash] = almacenado.split(":");
  if (!salt || !hash) return false;
  const hashCalculado = scryptSync(password, salt, LONGITUD_CLAVE);
  const hashGuardado = Buffer.from(hash, "hex");
  if (hashCalculado.length !== hashGuardado.length) return false;
  return timingSafeEqual(hashCalculado, hashGuardado);
}

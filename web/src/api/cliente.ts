import type { ErrorAPI } from "./tipos";

export class ErrorPeticion extends Error {
  codigo: string;
  status: number;
  constructor(status: number, codigo: string, mensaje: string) {
    super(mensaje);
    this.codigo = codigo;
    this.status = status;
  }
}

async function peticion<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const respuesta = await fetch(`/api${ruta}`, {
    ...opciones,
    credentials: "include",
    headers: {
      ...(opciones.body ? { "Content-Type": "application/json" } : {}),
      ...opciones.headers,
    },
  });

  if (respuesta.status === 204) return undefined as T;

  const contentType = respuesta.headers.get("content-type") ?? "";
  const cuerpo = contentType.includes("application/json") ? await respuesta.json() : await respuesta.text();

  if (!respuesta.ok) {
    const error = cuerpo as ErrorAPI;
    throw new ErrorPeticion(respuesta.status, error?.error ?? "error", error?.mensaje ?? "Error desconocido");
  }

  return cuerpo as T;
}

export const api = {
  get: <T>(ruta: string) => peticion<T>(ruta),
  post: <T>(ruta: string, datos?: unknown) =>
    peticion<T>(ruta, { method: "POST", body: datos !== undefined ? JSON.stringify(datos) : undefined }),
  patch: <T>(ruta: string, datos?: unknown) =>
    peticion<T>(ruta, { method: "PATCH", body: datos !== undefined ? JSON.stringify(datos) : undefined }),
  delete: <T>(ruta: string) => peticion<T>(ruta, { method: "DELETE" }),
};

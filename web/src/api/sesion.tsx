import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./cliente";
import type { Empleado } from "./tipos";

interface ContextoSesion {
  empleado: Empleado | null;
  cargando: boolean;
  entrar: (email: string, password: string) => Promise<void>;
  salir: () => Promise<void>;
}

const Contexto = createContext<ContextoSesion | null>(null);

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api
      .get<{ empleado: Empleado }>("/auth/yo")
      .then((r) => setEmpleado(r.empleado))
      .catch(() => setEmpleado(null))
      .finally(() => setCargando(false));
  }, []);

  const entrar = useCallback(async (email: string, password: string) => {
    const respuesta = await api.post<{ empleado: Empleado }>("/auth/login", { email, password });
    setEmpleado(respuesta.empleado);
  }, []);

  const salir = useCallback(async () => {
    await api.post("/auth/logout");
    setEmpleado(null);
  }, []);

  return <Contexto.Provider value={{ empleado, cargando, entrar, salir }}>{children}</Contexto.Provider>;
}

export function useSesion(): ContextoSesion {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useSesion debe usarse dentro de ProveedorSesion");
  return contexto;
}

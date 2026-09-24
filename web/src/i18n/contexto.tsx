import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { diccionario, type ClaveTexto, type Idioma } from "./diccionario";

const CLAVE_STORAGE = "gestor-ausencias:idioma";

function idiomaInicial(): Idioma {
  try {
    const guardado = localStorage.getItem(CLAVE_STORAGE);
    if (guardado === "es" || guardado === "ca" || guardado === "en") return guardado;
  } catch {
    // localStorage puede fallar en modo privado; nos quedamos con el idioma por defecto.
  }
  return "es";
}

interface ContextoIdioma {
  idioma: Idioma;
  cambiarIdioma: (idioma: Idioma) => void;
  t: (clave: ClaveTexto) => string;
  formatearFecha: (fechaISO: string) => string;
  formatearFechaCorta: (fechaISO: string) => string;
}

const Contexto = createContext<ContextoIdioma | null>(null);

const LOCALE_INTL: Record<Idioma, string> = { es: "es-ES", ca: "ca-ES", en: "en-GB" };

function partesFecha(fechaISO: string): [number, number, number] {
  const partes = fechaISO.split("-").map(Number);
  return [partes[0] ?? 1970, partes[1] ?? 1, partes[2] ?? 1];
}

export function ProveedorIdioma({ children }: { children: ReactNode }) {
  const [idioma, setIdioma] = useState<Idioma>(idiomaInicial);

  const cambiarIdioma = useCallback((nuevo: Idioma) => {
    setIdioma(nuevo);
    try {
      localStorage.setItem(CLAVE_STORAGE, nuevo);
    } catch {
      // Si no se puede guardar, el idioma solo dura la sesión de la pestaña.
    }
  }, []);

  const valor = useMemo<ContextoIdioma>(() => {
    const t = (clave: ClaveTexto) => diccionario[clave][idioma];
    const formatearFecha = (fechaISO: string) => {
      const [anio, mes, dia] = partesFecha(fechaISO);
      return new Intl.DateTimeFormat(LOCALE_INTL[idioma], {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(Date.UTC(anio, mes - 1, dia)));
    };
    const formatearFechaCorta = (fechaISO: string) => {
      const [anio, mes, dia] = partesFecha(fechaISO);
      return new Intl.DateTimeFormat(LOCALE_INTL[idioma], {
        day: "2-digit",
        month: "2-digit",
      }).format(new Date(Date.UTC(anio, mes - 1, dia)));
    };
    return { idioma, cambiarIdioma, t, formatearFecha, formatearFechaCorta };
  }, [idioma, cambiarIdioma]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useIdioma(): ContextoIdioma {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useIdioma debe usarse dentro de ProveedorIdioma");
  return contexto;
}

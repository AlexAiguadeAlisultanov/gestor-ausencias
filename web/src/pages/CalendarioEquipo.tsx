import { useEffect, useMemo, useState } from "react";
import { CalendarOff, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../api/cliente";
import { useSesion } from "../api/sesion";
import { useIdioma } from "../i18n/contexto";
import { EstadoVacio } from "../components/EstadoVacio";
import type { Empleado, Equipo, Solicitud, TipoAusencia } from "../api/tipos";

const COLOR_TIPO: Record<TipoAusencia, string> = {
  vacaciones: "var(--tipo-vacaciones)",
  asuntos_propios: "var(--tipo-asuntos-propios)",
  medico: "var(--tipo-medico)",
  baja: "var(--tipo-baja)",
  formacion: "var(--tipo-formacion)",
};

const CLAVE_TIPO: Record<TipoAusencia, "tipoVacaciones" | "tipoAsuntosPropios" | "tipoMedico" | "tipoBaja" | "tipoFormacion"> = {
  vacaciones: "tipoVacaciones",
  asuntos_propios: "tipoAsuntosPropios",
  medico: "tipoMedico",
  baja: "tipoBaja",
  formacion: "tipoFormacion",
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function CalendarioEquipo() {
  const { t, idioma } = useIdioma();
  const { empleado } = useSesion();
  const [fecha, setFecha] = useState(() => new Date());
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equipoId, setEquipoId] = useState<number | null>(null);
  const [miembros, setMiembros] = useState<Empleado[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);

  const anio = fecha.getFullYear();
  const mes = fecha.getMonth();
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const desde = `${anio}-${pad(mes + 1)}-01`;
  const hasta = `${anio}-${pad(mes + 1)}-${pad(diasEnMes)}`;

  useEffect(() => {
    if (empleado?.rol === "rrhh") {
      api.get<{ equipos: Equipo[] }>("/admin/equipos").then((r) => {
        setEquipos(r.equipos);
        setEquipoId((actual) => actual ?? r.equipos[0]?.id ?? null);
      });
    }
  }, [empleado]);

  useEffect(() => {
    if (empleado?.rol === "rrhh" && !equipoId) return;
    const query = empleado?.rol === "rrhh" ? `&equipoId=${equipoId}` : "";
    api
      .get<{ miembros: Empleado[]; solicitudes: Solicitud[] }>(`/equipo/calendario?desde=${desde}&hasta=${hasta}${query}`)
      .then((r) => {
        setMiembros(r.miembros);
        setSolicitudes(r.solicitudes);
      });
  }, [desde, hasta, equipoId, empleado]);

  const nombreMes = useMemo(() => {
    const formateado = new Intl.DateTimeFormat(idioma === "es" ? "es-ES" : idioma === "ca" ? "ca-ES" : "en-GB", {
      month: "long",
      year: "numeric",
    }).format(fecha);
    return formateado.charAt(0).toUpperCase() + formateado.slice(1);
  }, [fecha, idioma]);

  function solicitudEnDia(empleadoId: number, dia: number): Solicitud | undefined {
    const iso = `${anio}-${pad(mes + 1)}-${pad(dia)}`;
    return solicitudes.find((s) => s.empleadoId === empleadoId && s.fechaInicio <= iso && s.fechaFin >= iso);
  }

  return (
    <div className="contenedor" style={{ paddingBlock: "var(--espacio-5)", display: "flex", flexDirection: "column", gap: "var(--espacio-4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <span className="numero-seccion" style={{ fontSize: 13 }}>03</span>
          <h1 className="titular" style={{ fontSize: 22, marginTop: 4 }}>
            {t("calendarioTitulo")}
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {empleado?.rol === "rrhh" && equipos.length > 0 && (
            <select value={equipoId ?? ""} onChange={(e) => setEquipoId(Number(e.target.value))} style={{ padding: "8px 10px", borderRadius: "var(--radio-s)", border: "1px solid var(--borde)", background: "var(--superficie-alta)" }}>
              {equipos.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.nombre}
                </option>
              ))}
            </select>
          )}
          <button className="boton" aria-label={t("calendarioMesAnterior")} onClick={() => setFecha(new Date(anio, mes - 1, 1))}>
            <ChevronLeft size={16} strokeWidth={1.75} />
          </button>
          <span style={{ minWidth: 140, textAlign: "center", fontSize: 14 }}>{nombreMes}</span>
          <button className="boton" aria-label={t("calendarioMesSiguiente")} onClick={() => setFecha(new Date(anio, mes + 1, 1))}>
            <ChevronRight size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {miembros.length === 0 ? (
        <EstadoVacio icono={<CalendarOff size={28} strokeWidth={1.5} />}>{t("calendarioVacio")}</EstadoVacio>
      ) : (
        <div className="tabla-scroll">
          <table>
            <thead>
              <tr>
                <th style={{ position: "sticky", left: 0, background: "var(--superficie)" }}>{t("bandejaPersona")}</th>
                {Array.from({ length: diasEnMes }, (_, i) => i + 1).map((dia) => (
                  <th key={dia} style={{ textAlign: "center", padding: "6px 4px" }}>
                    {dia}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {miembros.map((m) => (
                <tr key={m.id}>
                  <td style={{ position: "sticky", left: 0, background: "var(--superficie)", fontWeight: 500 }}>{m.nombre}</td>
                  {Array.from({ length: diasEnMes }, (_, i) => i + 1).map((dia) => {
                    const s = solicitudEnDia(m.id, dia);
                    return (
                      <td key={dia} style={{ padding: 3, textAlign: "center" }}>
                        {s && (
                          <div
                            title={`${t(CLAVE_TIPO[s.tipo])} · ${t(s.estado === "pendiente" ? "estadoPendiente" : "estadoAprobada")}`}
                            style={{
                              height: 20,
                              borderRadius: 4,
                              background: COLOR_TIPO[s.tipo],
                              opacity: s.estado === "pendiente" ? 0.45 : 0.95,
                              border: s.estado === "pendiente" ? "1px dashed rgba(255,255,255,0.5)" : "none",
                            }}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "var(--texto-tenue)" }}>
        {(Object.keys(COLOR_TIPO) as TipoAusencia[]).map((tp) => (
          <span key={tp} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: COLOR_TIPO[tp], display: "inline-block" }} />
            {t(CLAVE_TIPO[tp])}
          </span>
        ))}
      </div>
    </div>
  );
}

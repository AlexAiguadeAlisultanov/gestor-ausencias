import { useEffect, useState, type FormEvent } from "react";
import { CalendarX2 } from "lucide-react";
import { api } from "../api/cliente";
import { ErrorPeticion } from "../api/cliente";
import { useSesion } from "../api/sesion";
import { useIdioma } from "../i18n/contexto";
import { Insignia } from "../components/Insignia";
import { EstadoVacio } from "../components/EstadoVacio";
import type { Jornada, SaldoTipo, Solicitud, TipoAusencia } from "../api/tipos";

const CLAVE_TIPO: Record<TipoAusencia, "tipoVacaciones" | "tipoAsuntosPropios" | "tipoMedico" | "tipoBaja" | "tipoFormacion"> = {
  vacaciones: "tipoVacaciones",
  asuntos_propios: "tipoAsuntosPropios",
  medico: "tipoMedico",
  baja: "tipoBaja",
  formacion: "tipoFormacion",
};

const TIPOS: TipoAusencia[] = ["vacaciones", "asuntos_propios", "medico", "baja", "formacion"];
const JORNADAS: Jornada[] = ["completa", "manana", "tarde"];

const CLAVE_JORNADA: Record<Jornada, "jornadaCompleta" | "jornadaManana" | "jornadaTarde"> = {
  completa: "jornadaCompleta",
  manana: "jornadaManana",
  tarde: "jornadaTarde",
};

export function PanelEmpleado() {
  const { t, formatearFecha } = useIdioma();
  const { empleado } = useSesion();
  const [saldos, setSaldos] = useState<SaldoTipo[] | null>(null);
  const [solicitudes, setSolicitudes] = useState<Solicitud[] | null>(null);

  const [tipo, setTipo] = useState<TipoAusencia>("vacaciones");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [jornadaInicio, setJornadaInicio] = useState<Jornada>("completa");
  const [jornadaFin, setJornadaFin] = useState<Jornada>("completa");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajeOk, setMensajeOk] = useState<string | null>(null);

  async function recargar() {
    const [r1, r2] = await Promise.all([
      api.get<{ saldos: SaldoTipo[] }>("/ausencias/saldo"),
      api.get<{ solicitudes: Solicitud[] }>("/ausencias"),
    ]);
    setSaldos(r1.saldos);
    setSolicitudes(r2.solicitudes);
  }

  useEffect(() => {
    recargar();
  }, []);

  async function enviarSolicitud(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMensajeOk(null);
    setEnviando(true);
    try {
      await api.post("/ausencias", { tipo, fechaInicio, fechaFin, jornadaInicio, jornadaFin });
      setMensajeOk(t("nuevaSolicitudOk"));
      setFechaInicio("");
      setFechaFin("");
      setJornadaInicio("completa");
      setJornadaFin("completa");
      await recargar();
    } catch (err) {
      setError(err instanceof ErrorPeticion ? err.message : t("errorGenerico"));
    } finally {
      setEnviando(false);
    }
  }

  async function cancelar(id: number) {
    setError(null);
    try {
      await api.post(`/ausencias/${id}/cancelar`);
      await recargar();
    } catch (err) {
      setError(err instanceof ErrorPeticion ? err.message : t("errorGenerico"));
    }
  }

  const puedeCancelar = (s: Solicitud) => {
    const hoy = new Date().toISOString().slice(0, 10);
    return (s.estado === "pendiente" || s.estado === "aprobada") && s.fechaInicio > hoy;
  };

  return (
    <div className="contenedor" style={{ paddingBlock: "var(--espacio-5)", display: "flex", flexDirection: "column", gap: "var(--espacio-5)" }}>
      <div>
        <span className="numero-seccion" style={{ fontSize: 13 }}>01</span>
        <h1 className="titular" style={{ fontSize: 22, marginTop: 4 }}>
          {empleado?.nombre}
        </h1>
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--espacio-3)",
        }}
      >
        {saldos?.map((s, indice) => (
          <div key={s.tipo} className="tarjeta entrada-escalonada" style={{ padding: "var(--espacio-4)", animationDelay: `${indice * 40}ms` }}>
            <h3 style={{ fontSize: 13, color: "var(--texto-tenue)", fontWeight: 500, marginBottom: "var(--espacio-3)" }}>
              {t(CLAVE_TIPO[s.tipo])}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--espacio-2)", fontSize: 13 }}>
              <Metrica etiqueta={t("saldoAsignados")} valor={s.saldo.asignados} />
              <Metrica etiqueta={t("saldoDisfrutados")} valor={s.saldo.disfrutados} />
              <Metrica etiqueta={t("saldoPendientes")} valor={s.saldo.pendientes} />
              <Metrica etiqueta={t("saldoDisponibles")} valor={s.saldo.disponibles} destacado />
            </div>
          </div>
        ))}
      </section>

      <section className="tarjeta" style={{ padding: "var(--espacio-4)" }}>
        <h2 style={{ fontSize: 16, marginBottom: "var(--espacio-3)" }}>{t("nuevaSolicitudTitulo")}</h2>
        <form onSubmit={enviarSolicitud} style={{ display: "grid", gap: "var(--espacio-3)", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", alignItems: "end" }}>
          <div className="campo">
            <label htmlFor="tipo">{t("nuevaSolicitudTipo")}</label>
            <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoAusencia)}>
              {TIPOS.map((tp) => (
                <option key={tp} value={tp}>
                  {t(CLAVE_TIPO[tp])}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="inicio">{t("nuevaSolicitudInicio")}</label>
            <input id="inicio" type="date" required value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="fin">{t("nuevaSolicitudFin")}</label>
            <input id="fin" type="date" required value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} min={fechaInicio || undefined} />
          </div>
          <div className="campo">
            <label htmlFor="jornadaInicio">{t("nuevaSolicitudJornadaInicio")}</label>
            <select id="jornadaInicio" value={jornadaInicio} onChange={(e) => setJornadaInicio(e.target.value as Jornada)}>
              {JORNADAS.map((j) => (
                <option key={j} value={j}>
                  {t(CLAVE_JORNADA[j])}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="jornadaFin">{t("nuevaSolicitudJornadaFin")}</label>
            <select id="jornadaFin" value={jornadaFin} onChange={(e) => setJornadaFin(e.target.value as Jornada)}>
              {JORNADAS.map((j) => (
                <option key={j} value={j}>
                  {t(CLAVE_JORNADA[j])}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="boton boton-primario" disabled={enviando}>
            {enviando ? t("nuevaSolicitudEnviando") : t("nuevaSolicitudEnviar")}
          </button>
        </form>
        {error && <p role="alert" style={{ color: "var(--error)", fontSize: 13, marginTop: "var(--espacio-3)" }}>{error}</p>}
        {mensajeOk && <p style={{ color: "var(--exito)", fontSize: 13, marginTop: "var(--espacio-3)" }}>{mensajeOk}</p>}
      </section>

      <section>
        <h2 style={{ fontSize: 16, marginBottom: "var(--espacio-3)" }}>{t("misSolicitudesTitulo")}</h2>
        {solicitudes && solicitudes.length === 0 && (
          <EstadoVacio icono={<CalendarX2 size={28} strokeWidth={1.5} />}>{t("misSolicitudesVacio")}</EstadoVacio>
        )}
        {solicitudes && solicitudes.length > 0 && (
          <div className="tabla-scroll">
            <table>
              <thead>
                <tr>
                  <th>{t("columnaTipo")}</th>
                  <th>{t("columnaFechas")}</th>
                  <th>{t("columnaDias")}</th>
                  <th>{t("columnaEstado")}</th>
                  <th className="ocultar-movil">{t("columnaComentario")}</th>
                  <th>{t("columnaAcciones")}</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s) => (
                  <tr key={s.id}>
                    <td>{t(CLAVE_TIPO[s.tipo])}</td>
                    <td>
                      {formatearFecha(s.fechaInicio)} – {formatearFecha(s.fechaFin)}
                    </td>
                    <td>{s.diasLaborables}</td>
                    <td>
                      <Insignia estado={s.estado} />
                    </td>
                    <td className="ocultar-movil" style={{ color: "var(--texto-tenue)" }}>
                      {s.comentarioResponsable ?? "—"}
                    </td>
                    <td>
                      {puedeCancelar(s) && (
                        <button className="boton boton-fantasma boton-peligro" style={{ padding: "6px 10px" }} onClick={() => cancelar(s.id)}>
                          {t("accionCancelar")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Metrica({ etiqueta, valor, destacado }: { etiqueta: string; valor: number; destacado?: boolean }) {
  return (
    <div>
      <div style={{ color: "var(--texto-tenue)", fontSize: 12 }}>{etiqueta}</div>
      <div style={{ fontSize: 20, fontWeight: 600, color: destacado ? "var(--acento)" : "var(--texto)" }}>{valor}</div>
    </div>
  );
}

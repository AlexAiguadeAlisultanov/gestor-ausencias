import { useEffect, useState } from "react";
import { CheckCircle2, Inbox, TriangleAlert, XCircle } from "lucide-react";
import { api, ErrorPeticion } from "../api/cliente";
import { useIdioma } from "../i18n/contexto";
import { EstadoVacio } from "../components/EstadoVacio";
import type { DiaCobertura, Empleado, Solicitud, TipoAusencia } from "../api/tipos";

const CLAVE_TIPO: Record<TipoAusencia, "tipoVacaciones" | "tipoAsuntosPropios" | "tipoMedico" | "tipoBaja" | "tipoFormacion"> = {
  vacaciones: "tipoVacaciones",
  asuntos_propios: "tipoAsuntosPropios",
  medico: "tipoMedico",
  baja: "tipoBaja",
  formacion: "tipoFormacion",
};

export function BandejaEquipo() {
  const { t, formatearFecha } = useIdioma();
  const [pendientes, setPendientes] = useState<Solicitud[] | null>(null);
  const [miembros, setMiembros] = useState<Empleado[]>([]);
  const [cobertura, setCobertura] = useState<Record<number, DiaCobertura[]>>({});
  const [comentarios, setComentarios] = useState<Record<number, string>>({});
  const [procesando, setProcesando] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function recargar() {
    const [p, m] = await Promise.all([
      api.get<{ solicitudes: Solicitud[] }>("/equipo/pendientes"),
      api.get<{ miembros: Empleado[] }>("/equipo/miembros"),
    ]);
    setPendientes(p.solicitudes);
    setMiembros(m.miembros);
    for (const s of p.solicitudes) {
      api
        .get<{ cobertura: DiaCobertura[] }>(`/equipo/solicitudes/${s.id}/cobertura`)
        .then((r) => setCobertura((prev) => ({ ...prev, [s.id]: r.cobertura })))
        .catch(() => {});
    }
  }

  useEffect(() => {
    recargar();
  }, []);

  async function decidir(id: number, decision: "aprobada" | "rechazada") {
    setError(null);
    setProcesando(id);
    try {
      await api.post(`/equipo/solicitudes/${id}/decision`, { decision, comentario: comentarios[id] || undefined });
      await recargar();
    } catch (err) {
      setError(err instanceof ErrorPeticion ? err.message : t("errorGenerico"));
    } finally {
      setProcesando(null);
    }
  }

  const nombreDe = (id: number) => miembros.find((m) => m.id === id)?.nombre ?? `#${id}`;

  return (
    <div className="contenedor" style={{ paddingBlock: "var(--espacio-5)", display: "flex", flexDirection: "column", gap: "var(--espacio-4)" }}>
      <div>
        <span className="numero-seccion" style={{ fontSize: 13 }}>02</span>
        <h1 className="titular" style={{ fontSize: 22, marginTop: 4 }}>
          {t("bandejaTitulo")}
        </h1>
      </div>

      {error && <p role="alert" style={{ color: "var(--error)", fontSize: 13 }}>{error}</p>}

      {pendientes && pendientes.length === 0 && (
        <EstadoVacio icono={<Inbox size={28} strokeWidth={1.5} />}>{t("bandejaVacia")}</EstadoVacio>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--espacio-3)" }}>
        {pendientes?.map((s, indice) => {
          const dias = cobertura[s.id];
          const peorDia = dias?.reduce((peor, d) => (d.disponibles < (peor?.disponibles ?? Infinity) ? d : peor), undefined as DiaCobertura | undefined);
          return (
            <div key={s.id} className="tarjeta entrada-escalonada" style={{ padding: "var(--espacio-4)", animationDelay: `${indice * 40}ms` }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{nombreDe(s.empleadoId)}</div>
                  <div style={{ fontSize: 13, color: "var(--texto-tenue)", marginTop: 2 }}>
                    {t(CLAVE_TIPO[s.tipo])} · {formatearFecha(s.fechaInicio)} – {formatearFecha(s.fechaFin)} · {s.diasLaborables} {t("dias")}
                  </div>
                </div>

                {peorDia && (
                  <div style={{ fontSize: 13, textAlign: "right" }}>
                    <div style={{ color: "var(--texto-tenue)" }}>{t("bandejaCobertura")}</div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        color: peorDia.bajoMinimo ? "var(--aviso)" : "var(--texto)",
                        fontWeight: 600,
                      }}
                    >
                      {peorDia.bajoMinimo && <TriangleAlert size={14} strokeWidth={2} />}
                      {peorDia.disponibles}/{peorDia.totalEquipo}
                    </div>
                    {peorDia.bajoMinimo && (
                      <div style={{ color: "var(--aviso)", fontSize: 12 }}>{t("bandejaCoberturaBaja")}</div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: "var(--espacio-3)", flexWrap: "wrap" }}>
                <input
                  placeholder={t("bandejaComentarioPlaceholder")}
                  value={comentarios[s.id] ?? ""}
                  onChange={(e) => setComentarios((prev) => ({ ...prev, [s.id]: e.target.value }))}
                  style={{
                    flex: 1,
                    minWidth: 220,
                    background: "var(--superficie-alta)",
                    border: "1px solid var(--borde)",
                    borderRadius: "var(--radio-s)",
                    padding: "8px 12px",
                  }}
                />
                <button
                  className="boton boton-primario"
                  disabled={procesando === s.id}
                  onClick={() => decidir(s.id, "aprobada")}
                >
                  <CheckCircle2 size={16} strokeWidth={1.75} />
                  {t("bandejaAprobar")}
                </button>
                <button
                  className="boton boton-peligro"
                  disabled={procesando === s.id}
                  onClick={() => decidir(s.id, "rechazada")}
                >
                  <XCircle size={16} strokeWidth={1.75} />
                  {t("bandejaRechazar")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

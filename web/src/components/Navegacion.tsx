import { CalendarDays, Inbox, LayoutGrid, LogOut, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useSesion } from "../api/sesion";
import { useIdioma } from "../i18n/contexto";
import { SelectorIdioma } from "./SelectorIdioma";

const ENLACE_BASE: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  borderRadius: "var(--radio-s)",
  fontSize: 14,
  color: "var(--texto-tenue)",
  textDecoration: "none",
  whiteSpace: "nowrap",
};

export function Navegacion() {
  const { empleado, salir } = useSesion();
  const { t } = useIdioma();
  if (!empleado) return null;

  const estiloEnlace = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    ...ENLACE_BASE,
    color: isActive ? "var(--texto)" : "var(--texto-tenue)",
    background: isActive ? "var(--superficie-alta)" : "transparent",
  });

  return (
    <header
      style={{
        borderBottom: "1px solid var(--borde-suave)",
        position: "sticky",
        top: "env(safe-area-inset-top, 0px)",
        background: "rgba(12, 12, 14, 0.85)",
        backdropFilter: "blur(10px)",
        zIndex: 10,
      }}
    >
      <div
        className="contenedor"
        style={{ display: "flex", alignItems: "center", gap: 16, paddingBlock: 12, flexWrap: "wrap" }}
      >
        <strong style={{ fontSize: 14, letterSpacing: "0.02em" }}>{t("appNombre")}</strong>

        <nav style={{ display: "flex", gap: 4, flexWrap: "wrap", marginInlineStart: 8 }}>
          <NavLink to="/panel" style={estiloEnlace}>
            <LayoutGrid size={16} strokeWidth={1.75} />
            {t("navMiPanel")}
          </NavLink>
          {(empleado.rol === "responsable" || empleado.rol === "rrhh") && (
            <NavLink to="/equipo" style={estiloEnlace}>
              <Inbox size={16} strokeWidth={1.75} />
              {t("navBandeja")}
            </NavLink>
          )}
          {(empleado.rol === "responsable" || empleado.rol === "rrhh") && (
            <NavLink to="/calendario" style={estiloEnlace}>
              <CalendarDays size={16} strokeWidth={1.75} />
              {t("navCalendario")}
            </NavLink>
          )}
          {empleado.rol === "rrhh" && (
            <NavLink to="/admin" style={estiloEnlace}>
              <Settings size={16} strokeWidth={1.75} />
              {t("navAdmin")}
            </NavLink>
          )}
        </nav>

        <div style={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <span className="ocultar-movil" style={{ fontSize: 13, color: "var(--texto-tenue)" }}>
            {empleado.nombre}
          </span>
          <SelectorIdioma />
          <button className="boton boton-fantasma" onClick={() => salir()} aria-label={t("navSalir")}>
            <LogOut size={16} strokeWidth={1.75} />
            <span className="ocultar-movil">{t("navSalir")}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

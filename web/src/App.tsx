import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useSesion } from "./api/sesion";
import { useIdioma } from "./i18n/contexto";
import { Navegacion } from "./components/Navegacion";
import { Login } from "./pages/Login";
import { PanelEmpleado } from "./pages/PanelEmpleado";
import { BandejaEquipo } from "./pages/BandejaEquipo";
import { CalendarioEquipo } from "./pages/CalendarioEquipo";
import { Admin } from "./pages/Admin";
import type { Rol } from "./api/tipos";

function Protegido({ roles, children }: { roles?: Rol[]; children: ReactNode }) {
  const { empleado, cargando } = useSesion();
  const { t } = useIdioma();

  if (cargando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "var(--texto-tenue)" }}>
        {t("cargando")}
      </div>
    );
  }
  if (!empleado) return <Navigate to="/" replace />;
  if (roles && !roles.includes(empleado.rol)) return <Navigate to="/panel" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <>
      <Navegacion />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/panel"
          element={
            <Protegido>
              <PanelEmpleado />
            </Protegido>
          }
        />
        <Route
          path="/equipo"
          element={
            <Protegido roles={["responsable", "rrhh"]}>
              <BandejaEquipo />
            </Protegido>
          }
        />
        <Route
          path="/calendario"
          element={
            <Protegido roles={["responsable", "rrhh"]}>
              <CalendarioEquipo />
            </Protegido>
          }
        />
        <Route
          path="/admin"
          element={
            <Protegido roles={["rrhh"]}>
              <Admin />
            </Protegido>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

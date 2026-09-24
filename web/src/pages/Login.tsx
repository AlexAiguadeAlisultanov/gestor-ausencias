import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useSesion } from "../api/sesion";
import { ErrorPeticion } from "../api/cliente";
import { useIdioma } from "../i18n/contexto";
import { SelectorIdioma } from "../components/SelectorIdioma";

const CUENTAS_DEMO = [
  { email: "laura@empresa.test", claveTexto: "loginEmpleada" as const },
  { email: "jordi@empresa.test", claveTexto: "loginResponsable" as const },
  { email: "rrhh@empresa.test", claveTexto: "loginRrhh" as const },
];

export function Login() {
  const { empleado, entrar } = useSesion();
  const { t } = useIdioma();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (empleado) return <Navigate to="/panel" replace />;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await entrar(email, password);
    } catch (err) {
      setError(err instanceof ErrorPeticion ? err.message : t("errorGenerico"));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--espacio-4)",
      }}
    >
      <div style={{ position: "fixed", top: 16, right: 16 }}>
        <SelectorIdioma />
      </div>

      <div className="tarjeta entrada-escalonada" style={{ width: "100%", maxWidth: 380, padding: "var(--espacio-5)" }}>
        <h1 className="titular" style={{ fontSize: 24 }}>
          {t("loginTitulo")}
        </h1>
        <p style={{ color: "var(--texto-tenue)", marginTop: 8, marginBottom: "var(--espacio-4)" }}>
          {t("loginSubtitulo")}
        </p>

        <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: "var(--espacio-3)" }}>
          <div className="campo">
            <label htmlFor="email">{t("loginEmail")}</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="campo">
            <label htmlFor="password">{t("loginPassword")}</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p role="alert" style={{ color: "var(--error)", fontSize: 13 }}>
              {error}
            </p>
          )}

          <button type="submit" className="boton boton-primario" disabled={enviando}>
            {t("loginEntrar")}
          </button>
        </form>

        <div style={{ marginTop: "var(--espacio-4)", paddingTop: "var(--espacio-3)", borderTop: "1px solid var(--borde-suave)" }}>
          <p style={{ fontSize: 12, color: "var(--texto-debil)", marginBottom: 8 }}>{t("loginEntrarComo")}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CUENTAS_DEMO.map((cuenta) => (
              <button
                key={cuenta.email}
                type="button"
                className="boton"
                style={{ fontSize: 13, padding: "6px 12px" }}
                onClick={() => {
                  setEmail(cuenta.email);
                  setPassword("prova1234");
                }}
              >
                {t(cuenta.claveTexto)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

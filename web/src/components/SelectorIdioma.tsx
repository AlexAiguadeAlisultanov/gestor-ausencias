import { Globe } from "lucide-react";
import { IDIOMAS } from "../i18n/diccionario";
import { useIdioma } from "../i18n/contexto";

export function SelectorIdioma() {
  const { idioma, cambiarIdioma } = useIdioma();
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span className="visualmente-oculto">Idioma</span>
      <Globe size={16} strokeWidth={1.75} color="var(--texto-tenue)" aria-hidden="true" />
      <select
        value={idioma}
        onChange={(e) => cambiarIdioma(e.target.value as typeof idioma)}
        style={{
          background: "transparent",
          border: "1px solid var(--borde)",
          borderRadius: "var(--radio-s)",
          padding: "6px 8px",
          fontSize: 13,
        }}
      >
        {IDIOMAS.map((i) => (
          <option key={i.codigo} value={i.codigo}>
            {i.etiqueta}
          </option>
        ))}
      </select>
    </label>
  );
}

import type { ReactNode } from "react";

export function EstadoVacio({ children, icono }: { children: ReactNode; icono?: ReactNode }) {
  return (
    <div className="estado-vacio">
      {icono && <div style={{ marginBottom: 8, opacity: 0.6 }}>{icono}</div>}
      <p>{children}</p>
    </div>
  );
}

import { useIdioma } from "../i18n/contexto";
import type { EstadoSolicitud } from "../api/tipos";

const CLAVES: Record<EstadoSolicitud, "estadoPendiente" | "estadoAprobada" | "estadoRechazada" | "estadoCancelada"> = {
  pendiente: "estadoPendiente",
  aprobada: "estadoAprobada",
  rechazada: "estadoRechazada",
  cancelada: "estadoCancelada",
};

export function Insignia({ estado }: { estado: EstadoSolicitud }) {
  const { t } = useIdioma();
  return <span className={`insignia insignia-${estado}`}>{t(CLAVES[estado])}</span>;
}

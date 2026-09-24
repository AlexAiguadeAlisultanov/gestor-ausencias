import { useEffect, useState, type FormEvent } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import { api, ErrorPeticion } from "../api/cliente";
import { useIdioma } from "../i18n/contexto";
import type { Empleado, Equipo, Festivo, Rol } from "../api/tipos";

type Pestana = "empleados" | "equipos" | "festivos" | "exportar";

export function Admin() {
  const { t } = useIdioma();
  const [pestana, setPestana] = useState<Pestana>("empleados");

  const pestanas: { id: Pestana; etiqueta: string }[] = [
    { id: "empleados", etiqueta: t("adminPestanaEmpleados") },
    { id: "equipos", etiqueta: t("adminPestanaEquipos") },
    { id: "festivos", etiqueta: t("adminPestanaFestivos") },
    { id: "exportar", etiqueta: t("adminPestanaExportar") },
  ];

  return (
    <div className="contenedor" style={{ paddingBlock: "var(--espacio-5)", display: "flex", flexDirection: "column", gap: "var(--espacio-4)" }}>
      <div>
        <span className="numero-seccion" style={{ fontSize: 13 }}>04</span>
        <h1 className="titular" style={{ fontSize: 22, marginTop: 4 }}>
          {t("adminTitulo")}
        </h1>
      </div>

      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--borde-suave)" }}>
        {pestanas.map((p) => (
          <button
            key={p.id}
            onClick={() => setPestana(p.id)}
            style={{
              background: "transparent",
              border: "none",
              borderBottom: pestana === p.id ? "2px solid var(--acento)" : "2px solid transparent",
              color: pestana === p.id ? "var(--texto)" : "var(--texto-tenue)",
              padding: "10px 14px",
              fontSize: 14,
              fontWeight: pestana === p.id ? 600 : 400,
            }}
          >
            {p.etiqueta}
          </button>
        ))}
      </div>

      {pestana === "empleados" && <PanelEmpleados />}
      {pestana === "equipos" && <PanelEquipos />}
      {pestana === "festivos" && <PanelFestivos />}
      {pestana === "exportar" && <PanelExportar />}
    </div>
  );
}

function PanelEmpleados() {
  const { t } = useIdioma();
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<Rol>("empleado");
  const [equipoId, setEquipoId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  async function recargar() {
    const [e, eq] = await Promise.all([
      api.get<{ empleados: Empleado[] }>("/admin/empleados"),
      api.get<{ equipos: Equipo[] }>("/admin/equipos"),
    ]);
    setEmpleados(e.empleados);
    setEquipos(eq.equipos);
  }

  useEffect(() => {
    recargar();
  }, []);

  async function crear(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/admin/empleados", {
        nombre,
        email,
        password,
        rol,
        equipoId: equipoId ? Number(equipoId) : null,
      });
      setNombre("");
      setEmail("");
      setPassword("");
      setRol("empleado");
      setEquipoId("");
      await recargar();
    } catch (err) {
      setError(err instanceof ErrorPeticion ? err.message : t("errorGenerico"));
    }
  }

  async function alternarActivo(emp: Empleado) {
    await api.patch(`/admin/empleados/${emp.id}`, { activo: !emp.activo });
    await recargar();
  }

  const nombreEquipo = (id: number | null) => equipos.find((eq) => eq.id === id)?.nombre ?? t("adminEmpleadosSinEquipo");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--espacio-4)" }}>
      <form onSubmit={crear} className="tarjeta" style={{ padding: "var(--espacio-4)", display: "grid", gap: "var(--espacio-3)", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", alignItems: "end" }}>
        <div className="campo">
          <label htmlFor="nombre">{t("adminEmpleadosNombre")}</label>
          <input id="nombre" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="emailNuevo">{t("adminEmpleadosEmail")}</label>
          <input id="emailNuevo" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="passNuevo">{t("adminEmpleadosPassword")}</label>
          <input id="passNuevo" type="text" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="rolNuevo">{t("adminEmpleadosRol")}</label>
          <select id="rolNuevo" value={rol} onChange={(e) => setRol(e.target.value as Rol)}>
            <option value="empleado">{t("adminRolEmpleado")}</option>
            <option value="responsable">{t("adminRolResponsable")}</option>
            <option value="rrhh">{t("adminRolRrhh")}</option>
          </select>
        </div>
        <div className="campo">
          <label htmlFor="equipoNuevo">{t("adminEmpleadosEquipo")}</label>
          <select id="equipoNuevo" value={equipoId} onChange={(e) => setEquipoId(e.target.value)}>
            <option value="">{t("adminEmpleadosSinEquipo")}</option>
            {equipos.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.nombre}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="boton boton-primario">
          <Plus size={16} strokeWidth={1.75} />
          {t("adminEmpleadosCrear")}
        </button>
      </form>

      {error && <p role="alert" style={{ color: "var(--error)", fontSize: 13 }}>{error}</p>}

      <div className="tabla-scroll">
        <table>
          <thead>
            <tr>
              <th>{t("adminEmpleadosNombre")}</th>
              <th>{t("adminEmpleadosEmail")}</th>
              <th>{t("adminEmpleadosRol")}</th>
              <th>{t("adminEmpleadosEquipo")}</th>
              <th>{t("adminEmpleadosActivo")}</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.nombre}</td>
                <td>{emp.email}</td>
                <td>{t(emp.rol === "empleado" ? "adminRolEmpleado" : emp.rol === "responsable" ? "adminRolResponsable" : "adminRolRrhh")}</td>
                <td>{nombreEquipo(emp.equipoId)}</td>
                <td>
                  <input type="checkbox" checked={emp.activo} onChange={() => alternarActivo(emp)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PanelEquipos() {
  const { t } = useIdioma();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [nombre, setNombre] = useState("");
  const [minimo, setMinimo] = useState(1);

  async function recargar() {
    const r = await api.get<{ equipos: Equipo[] }>("/admin/equipos");
    setEquipos(r.equipos);
  }

  useEffect(() => {
    recargar();
  }, []);

  async function crear(e: FormEvent) {
    e.preventDefault();
    await api.post("/admin/equipos", { nombre, minimoCobertura: minimo });
    setNombre("");
    setMinimo(1);
    await recargar();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--espacio-4)" }}>
      <form onSubmit={crear} className="tarjeta" style={{ padding: "var(--espacio-4)", display: "flex", gap: "var(--espacio-3)", flexWrap: "wrap", alignItems: "end" }}>
        <div className="campo">
          <label htmlFor="nombreEquipo">{t("adminEquiposNombre")}</label>
          <input id="nombreEquipo" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="minimoEquipo">{t("adminEquiposMinimo")}</label>
          <input id="minimoEquipo" type="number" min={0} required value={minimo} onChange={(e) => setMinimo(Number(e.target.value))} style={{ width: 100 }} />
        </div>
        <button type="submit" className="boton boton-primario">
          <Plus size={16} strokeWidth={1.75} />
          {t("adminEquiposCrear")}
        </button>
      </form>

      <div className="tabla-scroll">
        <table>
          <thead>
            <tr>
              <th>{t("adminEquiposNombre")}</th>
              <th>{t("adminEquiposMinimo")}</th>
            </tr>
          </thead>
          <tbody>
            {equipos.map((eq) => (
              <tr key={eq.id}>
                <td>{eq.nombre}</td>
                <td>{eq.minimoCobertura}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PanelFestivos() {
  const { t, formatearFecha } = useIdioma();
  const [festivos, setFestivos] = useState<Festivo[]>([]);
  const [fecha, setFecha] = useState("");
  const [nombre, setNombre] = useState("");
  const [ambito, setAmbito] = useState<"nacional" | "cataluna">("nacional");

  async function recargar() {
    const r = await api.get<{ festivos: Festivo[] }>("/admin/festivos");
    setFestivos(r.festivos);
  }

  useEffect(() => {
    recargar();
  }, []);

  async function crear(e: FormEvent) {
    e.preventDefault();
    await api.post("/admin/festivos", { fecha, nombre, ambito });
    setFecha("");
    setNombre("");
    await recargar();
  }

  async function eliminar(id: number) {
    await api.delete(`/admin/festivos/${id}`);
    await recargar();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--espacio-4)" }}>
      <form onSubmit={crear} className="tarjeta" style={{ padding: "var(--espacio-4)", display: "flex", gap: "var(--espacio-3)", flexWrap: "wrap", alignItems: "end" }}>
        <div className="campo">
          <label htmlFor="fechaFestivo">{t("adminFestivosFecha")}</label>
          <input id="fechaFestivo" type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="nombreFestivo">{t("adminFestivosNombre")}</label>
          <input id="nombreFestivo" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="ambitoFestivo">{t("adminFestivosAmbito")}</label>
          <select id="ambitoFestivo" value={ambito} onChange={(e) => setAmbito(e.target.value as "nacional" | "cataluna")}>
            <option value="nacional">{t("adminFestivosNacional")}</option>
            <option value="cataluna">{t("adminFestivosCataluna")}</option>
          </select>
        </div>
        <button type="submit" className="boton boton-primario">
          <Plus size={16} strokeWidth={1.75} />
          {t("adminFestivosCrear")}
        </button>
      </form>

      <div className="tabla-scroll">
        <table>
          <thead>
            <tr>
              <th>{t("adminFestivosFecha")}</th>
              <th>{t("adminFestivosNombre")}</th>
              <th>{t("adminFestivosAmbito")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {festivos.map((f) => (
              <tr key={f.id}>
                <td>{formatearFecha(f.fecha)}</td>
                <td>{f.nombre}</td>
                <td>{t(f.ambito === "nacional" ? "adminFestivosNacional" : "adminFestivosCataluna")}</td>
                <td>
                  <button className="boton boton-fantasma boton-peligro" style={{ padding: "6px 10px" }} onClick={() => eliminar(f.id)} aria-label={t("adminFestivosEliminar")}>
                    <Trash2 size={16} strokeWidth={1.75} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PanelExportar() {
  const { t } = useIdioma();
  const hoy = new Date().toISOString().slice(0, 10);
  const [desde, setDesde] = useState(`${hoy.slice(0, 4)}-01-01`);
  const [hasta, setHasta] = useState(`${hoy.slice(0, 4)}-12-31`);

  return (
    <div className="tarjeta" style={{ padding: "var(--espacio-4)", display: "flex", flexDirection: "column", gap: "var(--espacio-3)", maxWidth: 480 }}>
      <p style={{ color: "var(--texto-tenue)", fontSize: 13 }}>{t("adminExportarAyuda")}</p>
      <div style={{ display: "flex", gap: "var(--espacio-3)", flexWrap: "wrap" }}>
        <div className="campo">
          <label htmlFor="desdeExport">{t("adminExportarDesde")}</label>
          <input id="desdeExport" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="hastaExport">{t("adminExportarHasta")}</label>
          <input id="hastaExport" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
      </div>
      <a href={`/api/admin/exportar?desde=${desde}&hasta=${hasta}`} className="boton boton-primario" style={{ alignSelf: "flex-start" }}>
        <Download size={16} strokeWidth={1.75} />
        {t("adminExportarBoton")}
      </a>
    </div>
  );
}

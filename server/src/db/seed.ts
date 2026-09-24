import { hashPassword } from "../auth/password.js";
import { contarDiasLaborables } from "../engine/diasLaborables.js";
import {
  actualizarEstadoSolicitud,
  crearEmpleado,
  crearEquipo,
  crearFestivo,
  crearSolicitud,
  fijarAsignacion,
} from "./repositorio.js";

const ANIO_ACTUAL = new Date().getUTCFullYear();
const ANIO_SIGUIENTE = ANIO_ACTUAL + 1;

// Los festivos de fecha fija son iguales cada año. Los de Semana Santa dependen de la
// fecha de Pascua: los del año en curso ya están publicados en el BOE y el DOGC, los del
// año siguiente todavía no cuando se siembra esto en septiembre, así que se calculan con
// el algoritmo estándar del cómputo de Pascua (Gauss/Meeus).
function domingoDePascua(anio: number): { mes: number; dia: number } {
  const a = anio % 19;
  const b = Math.floor(anio / 100);
  const c = anio % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return { mes, dia };
}

function sumarDias(anio: number, mes: number, dia: number, delta: number): string {
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  fecha.setUTCDate(fecha.getUTCDate() + delta);
  return fecha.toISOString().slice(0, 10);
}

function pad(anio: number, mes: number, dia: number): string {
  return `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

function festivosDelAnio(anio: number): { fecha: string; nombre: string; ambito: "nacional" | "cataluna" }[] {
  const pascua = domingoDePascua(anio);
  const viernesSanto = sumarDias(anio, pascua.mes, pascua.dia, -2);
  const lunesPascua = sumarDias(anio, pascua.mes, pascua.dia, 1);

  return [
    { fecha: pad(anio, 1, 1), nombre: "Año Nuevo", ambito: "nacional" },
    { fecha: pad(anio, 1, 6), nombre: "Epifanía del Señor (Reyes)", ambito: "nacional" },
    { fecha: viernesSanto, nombre: "Viernes Santo", ambito: "nacional" },
    { fecha: pad(anio, 5, 1), nombre: "Fiesta del Trabajo", ambito: "nacional" },
    { fecha: pad(anio, 8, 15), nombre: "Asunción de la Virgen", ambito: "nacional" },
    { fecha: pad(anio, 10, 12), nombre: "Fiesta Nacional de España", ambito: "nacional" },
    { fecha: pad(anio, 12, 8), nombre: "Inmaculada Concepción", ambito: "nacional" },
    { fecha: pad(anio, 12, 25), nombre: "Navidad", ambito: "nacional" },
    { fecha: lunesPascua, nombre: "Lunes de Pascua Florida", ambito: "cataluna" },
    { fecha: pad(anio, 6, 24), nombre: "Sant Joan", ambito: "cataluna" },
    { fecha: pad(anio, 9, 11), nombre: "Diada Nacional de Catalunya", ambito: "cataluna" },
    { fecha: pad(anio, 12, 26), nombre: "Sant Esteve", ambito: "cataluna" },
  ];
}

interface DefinicionEmpleado {
  nombre: string;
  email: string;
  rol: "empleado" | "responsable" | "rrhh";
}

interface DefinicionEquipo {
  nombre: string;
  minimoCobertura: number;
  miembros: DefinicionEmpleado[]; // el primero es el responsable
}

const EQUIPOS: DefinicionEquipo[] = [
  {
    nombre: "Desarrollo",
    minimoCobertura: 2,
    miembros: [
      { nombre: "Jordi Puig", email: "jordi@empresa.test", rol: "responsable" },
      { nombre: "Laura Ferrer", email: "laura@empresa.test", rol: "empleado" },
      { nombre: "Marc Soler", email: "marc@empresa.test", rol: "empleado" },
      { nombre: "Anna Vidal", email: "anna@empresa.test", rol: "empleado" },
    ],
  },
  {
    nombre: "Comercial",
    minimoCobertura: 2,
    miembros: [
      { nombre: "Núria Camps", email: "nuria@empresa.test", rol: "responsable" },
      { nombre: "Pau Roig", email: "pau@empresa.test", rol: "empleado" },
      { nombre: "Marta Serra", email: "marta@empresa.test", rol: "empleado" },
      { nombre: "David Prats", email: "david@empresa.test", rol: "empleado" },
    ],
  },
  {
    nombre: "Atención al Cliente",
    minimoCobertura: 1,
    miembros: [
      { nombre: "Èlia Bosch", email: "elia@empresa.test", rol: "responsable" },
      { nombre: "Sergi Marín", email: "sergi@empresa.test", rol: "empleado" },
      { nombre: "Carla Vila", email: "carla@empresa.test", rol: "empleado" },
      { nombre: "Toni Reyes", email: "toni@empresa.test", rol: "empleado" },
    ],
  },
];

const ASIGNACIONES_ANUALES: Record<string, number> = {
  vacaciones: 23,
  asuntos_propios: 6,
  formacion: 5,
};

function formatearFecha(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

/** Suma o resta días naturales a hoy, para generar solicitudes de ejemplo relativas a la fecha actual. */
function fechaRelativaAHoy(deltaDias: number): string {
  const hoy = new Date();
  const fecha = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate()));
  fecha.setUTCDate(fecha.getUTCDate() + deltaDias);
  return formatearFecha(fecha);
}

export function sembrar(): void {
  const passwordDemo = hashPassword("prova1234");

  // Festivos de este año y el siguiente.
  const festivosPlano = [ANIO_ACTUAL, ANIO_SIGUIENTE].flatMap(festivosDelAnio);
  for (const f of festivosPlano) {
    crearFestivo(f.fecha, f.nombre, f.ambito);
  }

  const idsPorEmail = new Map<string, number>();

  for (const equipo of EQUIPOS) {
    const equipoId = crearEquipo(equipo.nombre, equipo.minimoCobertura);
    for (const miembro of equipo.miembros) {
      const id = crearEmpleado({
        nombre: miembro.nombre,
        email: miembro.email,
        passwordHash: passwordDemo,
        rol: miembro.rol,
        equipoId,
      });
      idsPorEmail.set(miembro.email, id);
      for (const anio of [ANIO_ACTUAL, ANIO_SIGUIENTE]) {
        for (const [tipo, dias] of Object.entries(ASIGNACIONES_ANUALES)) {
          fijarAsignacion(id, anio, tipo, dias);
        }
      }
    }
  }

  // Cuenta de RRHH, sin equipo: administra la empresa entera.
  const idRrhh = crearEmpleado({
    nombre: "Meritxell Costa",
    email: "rrhh@empresa.test",
    passwordHash: passwordDemo,
    rol: "rrhh",
    equipoId: null,
  });
  idsPorEmail.set("rrhh@empresa.test", idRrhh);
  for (const anio of [ANIO_ACTUAL, ANIO_SIGUIENTE]) {
    for (const [tipo, dias] of Object.entries(ASIGNACIONES_ANUALES)) {
      fijarAsignacion(idRrhh, anio, tipo, dias);
    }
  }

  const idJordi = idsPorEmail.get("jordi@empresa.test")!;
  const idLaura = idsPorEmail.get("laura@empresa.test")!;
  const idMarc = idsPorEmail.get("marc@empresa.test")!;
  const idAnna = idsPorEmail.get("anna@empresa.test")!;
  const idNuria = idsPorEmail.get("nuria@empresa.test")!;
  const idPau = idsPorEmail.get("pau@empresa.test")!;
  const idMarta = idsPorEmail.get("marta@empresa.test")!;
  const idDavid = idsPorEmail.get("david@empresa.test")!;
  const idElia = idsPorEmail.get("elia@empresa.test")!;
  const idSergi = idsPorEmail.get("sergi@empresa.test")!;
  const idCarla = idsPorEmail.get("carla@empresa.test")!;

  function anadirSolicitud(
    empleadoId: number,
    tipo: string,
    inicioDelta: number,
    finDelta: number,
    estado: "pendiente" | "aprobada" | "rechazada" | "cancelada",
    decisorId?: number,
    comentario?: string,
  ) {
    const fechaInicio = fechaRelativaAHoy(inicioDelta);
    const fechaFin = fechaRelativaAHoy(finDelta);
    const id = crearSolicitud({
      empleadoId,
      tipo,
      fechaInicio,
      fechaFin,
      jornadaInicio: "completa",
      jornadaFin: "completa",
      diasLaborables: contarDiasLaborables(fechaInicio, fechaFin, festivosPlano),
      creadaEn: new Date().toISOString(),
    });
    if (estado !== "pendiente") {
      actualizarEstadoSolicitud(
        id,
        estado,
        comentario ?? null,
        decisorId ?? null,
        new Date().toISOString(),
      );
    }
  }

  // Vacaciones ya disfrutadas, en el pasado, ya aprobadas.
  anadirSolicitud(idLaura, "vacaciones", -60, -54, "aprobada", idJordi, "Disfrútalas.");
  anadirSolicitud(idMarc, "vacaciones", -40, -36, "aprobada", idJordi, "Aprobado.");
  anadirSolicitud(idPau, "vacaciones", -30, -26, "aprobada", idNuria, "Sin problema.");
  anadirSolicitud(idSergi, "baja", -20, -16, "aprobada", idElia, "Recupérate.");

  // Pendientes de decidir ahora mismo, para que la bandeja del responsable no salga vacía.
  anadirSolicitud(idLaura, "vacaciones", 10, 14, "pendiente");
  anadirSolicitud(idMarc, "asuntos_propios", 12, 12, "pendiente");
  anadirSolicitud(idAnna, "formacion", 20, 21, "pendiente");
  anadirSolicitud(idPau, "vacaciones", 15, 19, "pendiente");
  anadirSolicitud(idMarta, "vacaciones", 16, 17, "pendiente");

  // Futuras ya aprobadas, para que el calendario de equipo muestre solapes y el aviso de cobertura.
  anadirSolicitud(idAnna, "vacaciones", 10, 16, "aprobada", idJordi, "Buen viaje.");
  anadirSolicitud(idJordi, "formacion", 25, 25, "aprobada", idRrhh, "Aprobado desde RRHH: un responsable no puede decidir sobre sí mismo.");
  anadirSolicitud(idCarla, "vacaciones", 30, 34, "aprobada", idElia, "Disfrútalas.");
  anadirSolicitud(idElia, "vacaciones", 40, 44, "pendiente");

  // Una cancelada, para ver ese estado también.
  anadirSolicitud(idMarta, "asuntos_propios", 5, 5, "cancelada");

  // Una rechazada, con comentario.
  anadirSolicitud(idDavid, "vacaciones", 8, 12, "rechazada", idNuria, "Coincide con el cierre mensual, pide otra semana.");
}

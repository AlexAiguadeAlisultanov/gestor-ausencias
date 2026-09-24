export type Idioma = "es" | "ca" | "en";

export const IDIOMAS: { codigo: Idioma; etiqueta: string }[] = [
  { codigo: "es", etiqueta: "ES" },
  { codigo: "ca", etiqueta: "CA" },
  { codigo: "en", etiqueta: "EN" },
];

type Diccionario = Record<string, Record<Idioma, string>>;

export const diccionario = {
  appNombre: { es: "Gestor de Ausencias", ca: "Gestor d'Absències", en: "Absence Manager" },
  cargando: { es: "Cargando…", ca: "Carregant…", en: "Loading…" },
  guardar: { es: "Guardar", ca: "Desar", en: "Save" },
  cancelar: { es: "Cancelar", ca: "Cancel·lar", en: "Cancel" },
  cerrar: { es: "Cerrar", ca: "Tancar", en: "Close" },
  volver: { es: "Volver", ca: "Tornar", en: "Back" },
  dias: { es: "días", ca: "dies", en: "days" },
  errorGenerico: {
    es: "Algo no ha salido bien. Inténtalo de nuevo.",
    ca: "Alguna cosa no ha anat bé. Torna-ho a provar.",
    en: "Something went wrong. Try again.",
  },

  // --- Login -----------------------------------------------------------
  loginTitulo: { es: "Gestor de Ausencias", ca: "Gestor d'Absències", en: "Absence Manager" },
  loginSubtitulo: {
    es: "Vacaciones, permisos y bajas de la plantilla, en un solo sitio.",
    ca: "Vacances, permisos i baixes de la plantilla, en un sol lloc.",
    en: "Vacation, leave and sick days for the whole team, in one place.",
  },
  loginEmail: { es: "Correo", ca: "Correu", en: "Email" },
  loginPassword: { es: "Contraseña", ca: "Contrasenya", en: "Password" },
  loginEntrar: { es: "Entrar", ca: "Entra", en: "Sign in" },
  loginEntrarComo: { es: "Entrar como", ca: "Entra com a", en: "Sign in as" },
  loginEmpleada: { es: "empleada", ca: "empleada", en: "employee" },
  loginResponsable: { es: "responsable", ca: "responsable", en: "manager" },
  loginRrhh: { es: "RRHH", ca: "RRHH", en: "HR" },
  loginError: {
    es: "Correo o contraseña incorrectos.",
    ca: "Correu o contrasenya incorrectes.",
    en: "Wrong email or password.",
  },

  // --- Navegación --------------------------------------------------------
  navMiPanel: { es: "Mi panel", ca: "El meu panell", en: "My dashboard" },
  navBandeja: { es: "Bandeja del equipo", ca: "Safata de l'equip", en: "Team inbox" },
  navCalendario: { es: "Calendario de equipo", ca: "Calendari de l'equip", en: "Team calendar" },
  navAdmin: { es: "Administración", ca: "Administració", en: "Admin" },
  navSalir: { es: "Salir", ca: "Surt", en: "Sign out" },

  // --- Tipos de ausencia ---------------------------------------------------
  tipoVacaciones: { es: "Vacaciones", ca: "Vacances", en: "Vacation" },
  tipoAsuntosPropios: { es: "Asuntos propios", ca: "Assumptes propis", en: "Personal day" },
  tipoMedico: { es: "Médico", ca: "Metge", en: "Medical" },
  tipoBaja: { es: "Baja", ca: "Baixa", en: "Sick leave" },
  tipoFormacion: { es: "Formación", ca: "Formació", en: "Training" },

  // --- Estados -------------------------------------------------------------
  estadoPendiente: { es: "Pendiente", ca: "Pendent", en: "Pending" },
  estadoAprobada: { es: "Aprobada", ca: "Aprovada", en: "Approved" },
  estadoRechazada: { es: "Rechazada", ca: "Rebutjada", en: "Rejected" },
  estadoCancelada: { es: "Cancelada", ca: "Cancel·lada", en: "Cancelled" },

  // --- Jornada ------------------------------------------------------------
  jornadaCompleta: { es: "Día completo", ca: "Dia complet", en: "Full day" },
  jornadaManana: { es: "Media jornada, mañana", ca: "Mitja jornada, matí", en: "Half day, morning" },
  jornadaTarde: { es: "Media jornada, tarde", ca: "Mitja jornada, tarda", en: "Half day, afternoon" },

  // --- Panel del empleado -------------------------------------------------
  saldoAsignados: { es: "Asignados", ca: "Assignats", en: "Assigned" },
  saldoDisfrutados: { es: "Disfrutados", ca: "Gaudits", en: "Used" },
  saldoPendientes: { es: "Pendientes de aprobar", ca: "Pendents d'aprovar", en: "Awaiting approval" },
  saldoDisponibles: { es: "Disponibles", ca: "Disponibles", en: "Available" },

  nuevaSolicitudTitulo: { es: "Pedir ausencia", ca: "Demanar absència", en: "Request time off" },
  nuevaSolicitudTipo: { es: "Tipo", ca: "Tipus", en: "Type" },
  nuevaSolicitudInicio: { es: "Desde", ca: "Des de", en: "From" },
  nuevaSolicitudFin: { es: "Hasta", ca: "Fins a", en: "To" },
  nuevaSolicitudJornadaInicio: { es: "Jornada del primer día", ca: "Jornada del primer dia", en: "First day" },
  nuevaSolicitudJornadaFin: { es: "Jornada del último día", ca: "Jornada de l'últim dia", en: "Last day" },
  nuevaSolicitudDiasCalculados: {
    es: "días laborables",
    ca: "dies laborables",
    en: "working days",
  },
  nuevaSolicitudEnviar: { es: "Enviar solicitud", ca: "Envia la sol·licitud", en: "Submit request" },
  nuevaSolicitudEnviando: { es: "Enviando…", ca: "Enviant…", en: "Submitting…" },
  nuevaSolicitudOk: {
    es: "Solicitud enviada. Tu responsable la revisará en breve.",
    ca: "Sol·licitud enviada. El teu responsable la revisarà aviat.",
    en: "Request sent. Your manager will review it soon.",
  },

  misSolicitudesTitulo: { es: "Mis solicitudes", ca: "Les meves sol·licituds", en: "My requests" },
  misSolicitudesVacio: {
    es: "Todavía no has pedido ninguna ausencia.",
    ca: "Encara no has demanat cap absència.",
    en: "You haven't requested any time off yet.",
  },
  columnaTipo: { es: "Tipo", ca: "Tipus", en: "Type" },
  columnaFechas: { es: "Fechas", ca: "Dates", en: "Dates" },
  columnaDias: { es: "Días", ca: "Dies", en: "Days" },
  columnaEstado: { es: "Estado", ca: "Estat", en: "Status" },
  columnaComentario: { es: "Comentario", ca: "Comentari", en: "Comment" },
  columnaAcciones: { es: "Acciones", ca: "Accions", en: "Actions" },
  accionCancelar: { es: "Cancelar", ca: "Cancel·la", en: "Cancel" },

  // --- Bandeja del responsable ----------------------------------------
  bandejaTitulo: { es: "Bandeja del equipo", ca: "Safata de l'equip", en: "Team inbox" },
  bandejaVacia: {
    es: "No hay solicitudes pendientes ahora mismo.",
    ca: "No hi ha sol·licituds pendents ara mateix.",
    en: "No pending requests right now.",
  },
  bandejaPersona: { es: "Persona", ca: "Persona", en: "Person" },
  bandejaCobertura: { es: "Cobertura esos días", ca: "Cobertura aquells dies", en: "Coverage those days" },
  bandejaCoberturaBaja: {
    es: "Por debajo del mínimo del equipo",
    ca: "Per sota del mínim de l'equip",
    en: "Below the team minimum",
  },
  bandejaAprobar: { es: "Aprobar", ca: "Aprova", en: "Approve" },
  bandejaRechazar: { es: "Rechazar", ca: "Rebutja", en: "Reject" },
  bandejaComentarioPlaceholder: {
    es: "Comentario (opcional en aprobación, recomendado al rechazar)",
    ca: "Comentari (opcional en aprovar, recomanat en rebutjar)",
    en: "Comment (optional to approve, recommended to reject)",
  },

  // --- Calendario de equipo -------------------------------------------
  calendarioTitulo: { es: "Calendario de equipo", ca: "Calendari de l'equip", en: "Team calendar" },
  calendarioMesAnterior: { es: "Mes anterior", ca: "Mes anterior", en: "Previous month" },
  calendarioMesSiguiente: { es: "Mes siguiente", ca: "Mes següent", en: "Next month" },
  calendarioVacio: {
    es: "Nadie de tu equipo tiene ausencias este mes.",
    ca: "Ningú del teu equip té absències aquest mes.",
    en: "No one on your team is out this month.",
  },
  calendarioEquipoSelector: { es: "Equipo", ca: "Equip", en: "Team" },

  // --- Administración -------------------------------------------------
  adminTitulo: { es: "Administración", ca: "Administració", en: "Admin" },
  adminPestanaEmpleados: { es: "Empleados", ca: "Empleats", en: "Employees" },
  adminPestanaEquipos: { es: "Equipos", ca: "Equips", en: "Teams" },
  adminPestanaFestivos: { es: "Festivos", ca: "Festius", en: "Holidays" },
  adminPestanaExportar: { es: "Exportar", ca: "Exporta", en: "Export" },

  adminEmpleadosNuevo: { es: "Nuevo empleado", ca: "Nou empleat", en: "New employee" },
  adminEmpleadosNombre: { es: "Nombre", ca: "Nom", en: "Name" },
  adminEmpleadosEmail: { es: "Correo", ca: "Correu", en: "Email" },
  adminEmpleadosPassword: { es: "Contraseña inicial", ca: "Contrasenya inicial", en: "Initial password" },
  adminEmpleadosRol: { es: "Rol", ca: "Rol", en: "Role" },
  adminEmpleadosEquipo: { es: "Equipo", ca: "Equip", en: "Team" },
  adminEmpleadosSinEquipo: { es: "Sin equipo", ca: "Sense equip", en: "No team" },
  adminEmpleadosActivo: { es: "Activo", ca: "Actiu", en: "Active" },
  adminEmpleadosCrear: { es: "Crear empleado", ca: "Crea l'empleat", en: "Create employee" },
  adminRolEmpleado: { es: "Empleado", ca: "Empleat", en: "Employee" },
  adminRolResponsable: { es: "Responsable", ca: "Responsable", en: "Manager" },
  adminRolRrhh: { es: "RRHH", ca: "RRHH", en: "HR" },

  adminEquiposNuevo: { es: "Nuevo equipo", ca: "Nou equip", en: "New team" },
  adminEquiposNombre: { es: "Nombre del equipo", ca: "Nom de l'equip", en: "Team name" },
  adminEquiposMinimo: {
    es: "Mínimo de cobertura",
    ca: "Mínim de cobertura",
    en: "Minimum coverage",
  },
  adminEquiposCrear: { es: "Crear equipo", ca: "Crea l'equip", en: "Create team" },

  adminFestivosNuevo: { es: "Nuevo festivo", ca: "Nou festiu", en: "New holiday" },
  adminFestivosFecha: { es: "Fecha", ca: "Data", en: "Date" },
  adminFestivosNombre: { es: "Nombre", ca: "Nom", en: "Name" },
  adminFestivosAmbito: { es: "Ámbito", ca: "Àmbit", en: "Scope" },
  adminFestivosNacional: { es: "Nacional", ca: "Nacional", en: "National" },
  adminFestivosCataluna: { es: "Cataluña", ca: "Catalunya", en: "Catalonia" },
  adminFestivosCrear: { es: "Añadir festivo", ca: "Afegeix el festiu", en: "Add holiday" },
  adminFestivosEliminar: { es: "Eliminar", ca: "Elimina", en: "Delete" },

  adminExportarDesde: { es: "Desde", ca: "Des de", en: "From" },
  adminExportarHasta: { es: "Hasta", ca: "Fins a", en: "To" },
  adminExportarBoton: { es: "Descargar CSV", ca: "Descarrega el CSV", en: "Download CSV" },
  adminExportarAyuda: {
    es: "Exporta todas las ausencias del rango elegido, de cualquier tipo y estado.",
    ca: "Exporta totes les absències del rang triat, de qualsevol tipus i estat.",
    en: "Exports every absence in the chosen range, any type or status.",
  },
} satisfies Diccionario;

export type ClaveTexto = keyof typeof diccionario;

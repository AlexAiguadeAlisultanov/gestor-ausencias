# Gestor de Ausencias

Una herramienta para llevar las vacaciones, los permisos y las bajas de una plantilla
organizada en equipos. Cada empleado pide sus días, su responsable los aprueba viendo
quién más del equipo ya está fuera esos días, y RRHH administra personas, equipos,
festivos y saca un CSV cuando lo necesita.

## El problema que resuelve

En muchas pymes esto se lleva en una hoja de cálculo compartida que nadie actualiza a
tiempo, o por WhatsApp al responsable, que luego tiene que acordarse de contarlo. Aquí
cada solicitud pasa por un flujo con estado, el saldo de días se calcula solo, y nadie
aprueba su propia ausencia porque el sistema no lo deja.

## Cuentas de demo

Todas con la contraseña `prova1234`. La pantalla de acceso trae botones para rellenarlas
solas.

| Correo | Rol | Qué ve |
|---|---|---|
| `laura@empresa.test` | Empleada | Su saldo y sus solicitudes, del equipo de Desarrollo |
| `jordi@empresa.test` | Responsable | La bandeja y el calendario del equipo de Desarrollo |
| `rrhh@empresa.test` | RRHH | Empleados, equipos, festivos y la exportación |

Hay doce personas más sembradas en tres equipos (Desarrollo, Comercial y Atención al
Cliente), con solicitudes pasadas, pendientes y futuras, para que ninguna pantalla salga
vacía la primera vez que se abre.

## Cómo arrancarlo

```
npm install
npm run dev
```

Eso levanta la API en el puerto 8002 y la interfaz en el 5183, con la segunda hablando
con la primera. Si prefieres verlo tal como queda en producción:

```
npm run build
npm start
```

La base de datos es un fichero SQLite que se crea solo la primera vez, en
`server/data/ausencias.db`, y se siembra con los datos de ejemplo si está vacía. En
Render el disco es efímero: cada vez que el servicio se reinicia, la demo vuelve a
sembrarse desde cero. Es lo que se espera de una demo pública, no un fallo.

## Cómo está hecho

Un solo repositorio con dos partes. `server/` es una API en TypeScript con Express 5,
sesión con cookie firmada y contraseñas con `scrypt`, sobre SQLite a través de
`node:sqlite`, el módulo nativo que trae Node 24 sin nada que compilar. `web/` es una
interfaz en React 19 con Vite, sin librería de componentes, con los textos en español,
catalán e inglés en un diccionario propio.

Las reglas de negocio (contar días laborables, calcular saldos, decidir si una solicitud
puede pasar de un estado a otro) viven en `server/src/engine/`, aparte de las rutas y
de la base de datos, y tienen tests con Vitest. Es la parte que de verdad puede fallar,
así que es la que está comprobada.

## Decisiones y por qué

**El cálculo de días cuenta solo laborables.** Fines de semana fuera, y los festivos
nacionales y catalanes del año en curso y el siguiente vienen sembrados de fábrica.
Los del año siguiente se calculan con el algoritmo estándar de la fecha de Pascua
(Gauss), porque en septiembre, cuando se siembra esta demo, el calendario oficial del
año que viene todavía no está publicado en el BOE. RRHH puede añadir o quitar festivos
desde la administración si algo cambia.

**Vacaciones, asuntos propios y formación descuentan del saldo del año; médico y baja
no.** Cada tipo que descuenta tiene su propia bolsa de días, porque en la vida real no
comparten cupo.

**Un responsable nunca decide sobre su propia solicitud.** Si un responsable pide unos
días, quien los aprueba es RRHH, no otro compañero de su mismo nivel. La regla vive en
el servidor, no en la interfaz: no basta con esconder el botón.

**La cobertura se enseña antes de aprobar, no después.** Cada solicitud pendiente
muestra cuánta gente del equipo ya está fuera esos días, y avisa si eso deja al equipo
por debajo del mínimo que RRHH haya fijado para ese equipo. La decisión sigue siendo del
responsable: el aviso informa, no bloquea.

**Sesión con cookie firmada a mano, sin librería.** El proyecto ya usa `crypto` para las
contraseñas, así que firmar la cookie con HMAC y verificarla en cada petición no pedía
una dependencia más.

## Qué falta por hacer

La foto de cada persona, notificaciones por correo cuando cambia el estado de una
solicitud, y un histórico de festivos de años anteriores para consultar ausencias viejas
con precisión. Ninguna de las tres hacía falta para que la herramienta funcionara un
lunes por la mañana.

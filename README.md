# SaludCitas

Sistema web de agendamiento de citas médicas, desarrollado en Angular con arquitectura basada en módulos (`standalone: false`).

Proyecto de Herramientas III · Tecnología en Desarrollo de Software · Institución Universitaria Pascual Bravo.
Autor: Jose Alfonso Madera Madera.

## Funcionalidad

**Paciente**
- Registro e inicio de sesión con correo y contraseña.
- Consulta de especialidades, médicos (filtrados por especialidad y sede) y horarios disponibles.
- Agendar una cita en 4 pasos: especialidad y sede, médico, fecha y hora, confirmación.
- Listado de citas propias (próximas e historial) con filtro y búsqueda.
- Cancelación de citas programadas, con ventana de confirmación.

**Administrador**
- Registrar, editar y activar/desactivar médicos.
- Gestionar especialidades y sedes (crear, editar, eliminar), con validación de datos en uso.

**Retroalimentación visual:** spinners de carga, alertas de éxito y error, mensajes de validación en los formularios y confirmación antes de acciones destructivas.

## Tecnologías y librerías

- Angular 22 con `NgModule` (`standalone: false`)
- Angular Router (lazy loading y guards por rol)
- Reactive Forms con validaciones
- RxJS (`Observable`, `of`, `delay`, `BehaviorSubject`)
- Bootstrap 5.3 y Bootstrap Icons
- SCSS

## Arquitectura

```
src/app/
├── core/       CoreModule: servicios singleton, guards, modelos, datos de prueba y navbar
├── shared/     SharedModule: spinner, alertas, modal de confirmación, página 404 y pipe
├── features/
│   ├── auth/       Login y registro
│   ├── paciente/   Inicio, agendar cita y mis citas
│   └── admin/      Médicos, especialidades y sedes
├── app-module.ts
└── app-routing-module.ts
```

Los componentes contenedores (con la lógica) inyectan servicios; los de presentación, como `CitaCard`, solo reciben datos con `@Input()` y emiten eventos con `@Output()`.

## Datos simulados

No hay backend real. Toda la lógica de datos vive en servicios `@Injectable` que devuelven `Observable` con `delay` para simular una API. El estado local se maneja de forma inmutable (copias con spread, `map` y `filter`). La sesión se simula con un token falso guardado en `localStorage`.

Al recargar la página, los datos (citas, cuentas nuevas, cambios del administrador) vuelven a su estado inicial; la sesión se mantiene.

## Instalación y ejecución local

Requisitos: Node.js (versión LTS reciente; desarrollado con Node 24) y Angular CLI.

```bash
git clone https://github.com/josealfo768/salud-citas.git
cd salud-citas
npm install
ng serve
```

Abre `http://localhost:4200` en el navegador.

Para generar la versión de producción: `ng build`.

## Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Paciente | paciente@correo.com | Paciente123 |
| Administrador | admin@saludcitas.com | Admin123 |

También puedes crear una cuenta de paciente desde la pantalla de registro.

## Notas de diseño

- Se añadieron los campos `activo` y `sedeIds` al modelo de médico, para poder desactivarlos y filtrarlos por sede.
- Los horarios disponibles se generan en el servicio: lunes a viernes, de 8:00 a 12:00 y de 14:00 a 17:00, cada 30 minutos, excluyendo los ya ocupados.
- El documento de definición original plantea React, Node.js y SQL Server; esta entrega implementa el frontend en Angular con un backend simulado.

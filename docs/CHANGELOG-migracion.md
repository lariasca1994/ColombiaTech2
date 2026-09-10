# Changelog de migración — de ColombiaTech v1 a v2

Registro de todo lo que se encontró y se decidió durante la
reconstrucción. Útil como referencia propia y como material para explicar
el proceso en una entrevista técnica.

## Seguridad

- **[CRÍTICO]** `React/.env` estaba comiteado en git desde abril 2024, con
  una credencial real de MongoDB Atlas en texto plano. Se rotó la
  credencial en Atlas y se excluyó `.env` explícitamente en el
  `.gitignore` del frontend — **causa raíz real**: el `.gitignore` que
  genera Vite por defecto solo ignora `*.local`, no `.env` — por eso pudo
  comitearse la primera vez.
- El login devolvía el usuario completo, incluyendo el hash bcrypt del
  password, al cliente. Corregido: el password ahora tiene `select: false`
  a nivel de esquema Mongoose, y el login solo devuelve un JWT + datos
  públicos.
- Ningún controlador (`houses`, `users`, `messages`) tenía `@UseGuards` —
  la API estaba completamente abierta sin autenticación real. Se agregó
  `JwtAuthGuard` con criterio: lectura de casas pública, todo lo demás
  protegido.

## Arquitectura

- Existían tres implementaciones de backend (`Nest`, `Tech` con
  Express+GraphQL, y una copia duplicada de React). Se decidió una sola
  base: NestJS, con GraphQL integrado (`@nestjs/graphql`) en vez de un
  servidor Express aparte.
- `HousesService.update` tenía un `catch` sin `try`, y `delete` había
  quedado anidado dentro de `update` por error — el archivo no compilaba
  tal cual estaba. Corregido.
- `MessagesService` en Nest era el scaffold vacío que genera
  `nest generate resource` (nunca se implementó). Se construyó la lógica
  real, basada en el patrón que sí tenía `Tech/routes/MessageRoutes.js`.
- El chat en tiempo real nunca funcionó: el bloque de Socket.IO en
  `Tech/index.js` estaba comentado. Se implementó por primera vez un
  `ChatGateway` real dentro de Nest.
- `Tech/models/Chat.js` tenía errores de sintaxis (`moongoose.Schema`) y
  no lo usaba ningún archivo — se eliminó, no se migró.
- El socket del chat en el frontend se recreaba en cada render (estaba
  fuera de un `useEffect`) — corregido con `useEffect` + `useRef`.
- Había una ruta `/chat` duplicada en `App.jsx` — eliminada.
- El `.env` del frontend tenía `DB_URL` y `JWT_SECRET`, que no tienen
  ningún motivo para existir en un cliente — un frontend solo necesita
  URLs públicas del API.

## Lo que se eliminó (y por qué)

| Qué | Por qué |
|---|---|
| `Tech/` (backend Express+GraphQL aparte) | Reemplazado — su lógica útil (CRUD de mensajes, GraphQL) se integró dentro de Nest |
| `React/react/` | Copia duplicada y vieja del scaffold de Vite, nunca borrada al crear la versión real |
| `Tech/uploads/` | Archivos de prueba y fotos personales comiteados al repo por error |
| `Documentación/` | PDFs de libros con derechos de autor — ya la habías quitado tú |
| `Tech/models/Chat.js` | Roto y sin uso |
| `React/components/chat/ChatWindow.jsx`, `MessageList.jsx`, `MessageInput.jsx`, `features/chatSlice.js` | Segunda implementación de chat, nunca registrada en el store de Redux ni enrutada — muerta desde el inicio, con un bug propio (auto-importación circular) |

## Auditoría de conexión frontend ↔ backend (encontrada al probar en vivo)

Esto se descubrió corriendo el proyecto real por primera vez, no en la
revisión inicial de código — documentado aquí porque es la causa de que
"crear usuario" fallara con un error de CORS:

- **Los tres `apiSlice` de RTK Query (`apiSlice.js`, `apiHousesSlice.js`,
  `apiMessageSlice.js`) apuntaban con `baseUrl` hardcodeado a
  `https://nodejs-chi-seven.vercel.app/`** — el backend de demostración
  del instructor del bootcamp. El frontend original **nunca estuvo
  conectado a `Nest` ni a `Tech`** para las llamadas REST de
  usuarios/casas/mensajes. Corregido: ahora usan `VITE_API_URL`.
- Rutas que no coincidían con el backend nuevo: `/user` → `/users`,
  `/message` → `/messages`, `login` → `auth/login`.
- Métodos que no coincidían: `updateUser`/`updateHouse` usaban `PATCH`,
  el backend nuevo expone `PUT` para esas actualizaciones.
- `AuthResult` en el backend devolvía `accessToken`; `authSlice.js` en el
  frontend siempre esperó `token`. Renombrado en el backend para calzar
  con el frontend ya existente.
- Las casas se identifican por su `code` legible (ej. "H-1024"), no por
  el `_id` de Mongo — así llamaba el frontend (`getHouseByCode`,
  `updateHouse`, `deleteHouse`). El backend nuevo originalmente usaba
  `findById`, lo que habría fallado siempre; corregido a `findOne({code})`
  / `findOneAndUpdate({code})` / `findOneAndDelete({code})`.
- `HouseList.jsx` mostraba `house.avatar` (ese campo no existe en House,
  es de User) — corregido a `house.image`.
- `apiMessageSlice.js` no enviaba el header `Authorization` — ahora que
  `/messages` requiere JWT, se agregó `prepareHeaders`.

## Pendiente (fuera de alcance de esta reconstrucción)

- Tests (Jest) para el backend nuevo.
- Arreglar el Deployment Protection de Vercel para que el demo en vivo
  sea público.
- El endpoint de subida de avatar (`/upload/:id/user`) no existe todavía
  en el backend nuevo — `uploadAvatar` en `apiSlice.js` fallará hasta que
  se agregue ese módulo.
- Revisar el resto de componentes de React (auth, house, user) con el
  mismo nivel de detalle — esta pasada se enfocó en seguridad,
  arquitectura del backend, el menú Casas/Chat, y la conexión real
  frontend-backend.

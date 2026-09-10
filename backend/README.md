# ColombiaTech — Backend (v2)

Backend único (REST + GraphQL + WebSockets) que reemplaza los dos backends
que convivían en el proyecto original (`Nest/` y `Tech/`). Construido desde
cero, según lo acordado, en vez de parchar el código viejo.

## Qué se corrigió respecto al original (con evidencia)

| Problema encontrado | Dónde | Corrección |
|---|---|---|
| Login devolvía el usuario completo, **incluyendo el hash bcrypt del password** | `Nest/src/auth/auth.service.ts` | `AuthService.login` ahora emite un JWT y un objeto de usuario explícitamente sin password |
| Ningún controlador tenía `@UseGuards` — la API entera estaba abierta | `houses`, `users`, `messages` controllers | `JwtAuthGuard` aplicado con criterio: lectura pública en houses, todo lo demás protegido |
| `HousesService.update` tenía un `catch` sin `try`, y `delete` quedó anidado dentro de `update` por error — **no compilaba** | `Nest/src/houses/houses.service.ts` | Reescrito, cada método separado y correcto |
| `MessagesService` era solo el scaffold vacío de `nest generate` (`'This action adds a new message'`) | `Nest/src/messages/messages.service.ts` | Implementación real, basada en el patrón bueno que sí tenía `Tech/routes/MessageRoutes.js` (incluyendo excluir el password al popular `from`/`to`) |
| El chat en tiempo real nunca funcionó: el bloque de Socket.IO estaba comentado en `Tech/index.js` | `Tech/index.js` | `messages.gateway.ts`: implementación real y nueva, con los mismos nombres de evento (`message` / `message-receipt`) que ya esperaba el frontend |
| `models/Chat.js` (en Tech) tenía errores reales (`moongoose.Schema`, typo) y no lo usaba nada | `Tech/models/Chat.js` | Eliminado — no se migró, era código muerto |
| GraphQL vivía en un backend Express aparte (`Tech/graphql/`) | `Tech/graphql/` | Integrado dentro de Nest con `@nestjs/graphql` (code-first), reusando los mismos `services` que REST — sin lógica duplicada |
| El DTO de creación de usuario pedía un campo `id: number` sin sentido para un documento Mongo | `Nest/src/users/dto/create-user.dto.ts` | Eliminado |

## Arquitectura

```
src/
├── auth/          # JWT: login, estrategia, guard
├── users/         # REST + GraphQL, password nunca expuesto
├── houses/        # REST + GraphQL, lectura pública / escritura protegida
├── messages/       # REST + GraphQL + WebSocket Gateway (chat real)
└── app.module.ts   # conecta Mongo + GraphQL + los 4 módulos
```

Cada módulo expone la misma lógica de negocio (el `Service`) tanto por REST
(`Controller`) como por GraphQL (`Resolver`) — no hay dos implementaciones
paralelas de las reglas de negocio, solo dos formas de exponerlas.

## Cómo correrlo

```bash
npm install
cp .env-ejemplo .env   # y completa DB_URL / JWT_SECRET reales
npm run start:dev
```

- REST: `http://localhost:3000/house`, `/users`, `/messages`, `/auth/login`
- GraphQL Playground: `http://localhost:3000/graphql`
- WebSocket del chat: mismo puerto, evento `message` / `message-receipt`

## ⚠️ Nota de transparencia

Este código se escribió sin poder instalarlo ni compilarlo: el entorno
donde lo generé no tiene acceso a internet ni para `npm install` (mismo
límite que tuvo la versión en Java). La lógica reutiliza patrones de
NestJS estándar y probé cuidadosamente cada import y decorador, pero
**el primer `npm install && npm run start:dev` que corras tú es la primera
vez que esto se ejecuta de verdad.** Si algo no compila o no levanta,
copia el error aquí y lo corregimos de inmediato — como pasó con el
proyecto de Java.

## Próximos pasos

- Reorganizar el frontend en dos secciones de menú: Casas y Chat.
- Agregar tests (unit + e2e) — este backend no trae specs todavía.

# Alquiler de vivienda · Backend

Backend en NestJS que expone la misma lógica de negocio de tres formas: REST, GraphQL (code-first)
y WebSockets para el chat. Cada módulo tiene un único `Service` que usan su `Controller` (REST) y su
`Resolver` (GraphQL), así no hay reglas duplicadas.

```
src/
├── auth/       Ingreso y verificación en dos pasos
├── users/      Cuentas
├── houses/     Casas e ilustraciones automáticas
├── messages/   Chat en tiempo real
└── upload/     Carga de imágenes
```

## Correrlo en tu equipo

```bash
npm install
cp .env-ejemplo .env   # completa las variables que indica la plantilla
npm run start:dev
```

Queda en `http://localhost:3000`. Las pruebas se corren con `npm test`.
Uso de la plataforma: [manual de usuario](../docs/MANUAL.md).

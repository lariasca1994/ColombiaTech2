# ColombiaTech2

<p>
  <a href="https://colombia-tech2.vercel.app"><img src="docs/demo-badge.svg" alt="Abrir la demo en vivo" height="32"></a>
  <a href="https://frontend-nine-topaz-99.vercel.app"><img src="https://portafolio-status.onrender.com/api/status/colombiatech2/badge.svg" alt="Estado en vivo del proyecto" height="32"></a>
  <a href="https://d4i3vsgw7xwmh.cloudfront.net"><img src="https://portafolio-status.onrender.com/api/status/colombiatech2/qa-badge.svg" alt="Fecha y resultado de la última prueba E2E" height="32"></a>
</p>

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

Plataforma de alquiler de vivienda con chat en tiempo real entre interesado y
arrendador. Backend unificado en NestJS que expone REST, GraphQL y WebSockets
sobre la misma base de código, con frontend en React.

### En pocas palabras

- **Qué hace:** quien busca vivienda puede ver inmuebles publicados y hablar por
  chat, en tiempo real, con el arrendador. El arrendador publica sus inmuebles
  con fotos.
- **Qué lo hace interesante:** un solo backend atiende tres formas de consumir
  los mismos datos —REST, GraphQL y WebSockets— sin duplicar lógica.
- **Cómo probarlo:** entra a la [demo](https://colombia-tech2.vercel.app), crea
  una cuenta y publica o busca un inmueble. Para correrlo en tu equipo, ve a
  [Ejecución](#ejecución).

## Demo en vivo

- **Aplicación:** [colombia-tech2.vercel.app](https://colombia-tech2.vercel.app)
- **API REST:** `https://colombiatech2.onrender.com/api`
- **GraphQL Playground:** `https://colombiatech2.onrender.com/graphql`

> El backend corre en el plan gratuito de Render, que suspende el servicio tras
> un período de inactividad. La primera petición tras la suspensión puede
> tardar entre 30 y 50 segundos en responder mientras el servicio despierta.

## Arquitectura

<p align="center">
  <img src="docs/arquitectura.svg" alt="Diagrama de arquitectura: frontend React en Vercel, backend NestJS en Render con REST, GraphQL y WebSockets, MongoDB Atlas y Cloudinary" width="100%">
</p>

- **Vercel** sirve la aplicación React (Vite + Redux Toolkit + Tailwind) y el
  cliente de chat.
- **Render** corre el backend NestJS: las rutas REST (`/api`), GraphQL
  (`/graphql`) y el gateway de chat (Socket.IO) llegan a los mismos módulos de
  dominio, protegidos con JWT.
- **MongoDB Atlas** guarda usuarios, inmuebles y mensajes; **Cloudinary**, las
  imágenes.

## Funcionalidades

- Registro e inicio de sesión con JSON Web Tokens
- Publicación y consulta de inmuebles
- Carga de imágenes (avatares y fotos de inmuebles) con almacenamiento
  persistente en la nube
- Acceso restringido: cada usuario solo alcanza su propia información
- Chat en tiempo real mediante WebSockets
- Misma información disponible por REST y por GraphQL

Un único backend NestJS sirve las tres interfaces (REST, GraphQL y
WebSockets) sobre los mismos módulos de dominio, evitando duplicar lógica de
negocio entre capas.

## Estructura

```
ColombiaTech2/
├── backend/          NestJS — REST, GraphQL y WebSockets
│   └── src/
│       ├── auth/     Autenticación JWT y guards
│       ├── users/
│       ├── houses/
│       ├── upload/   Carga de imágenes a Cloudinary
│       └── messages/ Gateway del chat
└── frontend/         React + Vite + Redux Toolkit + Tailwind
    └── src/
        ├── components/
        ├── pages/
        └── store/    Estado global con Redux Toolkit
```

## Stack

**Backend:** NestJS, MongoDB con Mongoose, GraphQL (Apollo, enfoque code-first),
Passport con JWT, Socket.IO

**Frontend:** React 18, Vite, Redux Toolkit, React Router, Tailwind CSS,
Socket.IO client

## Conexiones externas

| Servicio | Uso |
|---|---|
| MongoDB Atlas | Persistencia de datos (usuarios, casas, mensajes) |
| Cloudinary | Almacenamiento de imágenes (avatares de usuario y fotos de inmuebles) |

## Requisitos

- Node.js 18 o superior
- npm
- Una instancia de MongoDB accesible
- Una cuenta de Cloudinary (plan gratuito) para la carga de imágenes

## Ejecución

Backend y frontend se levantan por separado, en dos terminales.

### Backend

```bash
cd backend
npm install
cp .env-ejemplo .env
npm run start:dev
```

El `.env` requiere la cadena de conexión a MongoDB, un secreto para firmar los
tokens y las credenciales de Cloudinary. La plantilla indica el nombre de cada
variable.

Queda escuchando en `http://localhost:3000`.

- API REST bajo `/api`
- Consola de GraphQL en `/graphql`
- WebSocket del chat en la misma raíz

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

El `.env` necesita la URL del backend. Queda en `http://localhost:5173`.

## Despliegue

El backend está preparado para Render, que en su plan gratuito admite conexiones
WebSocket persistentes. El frontend, para Vercel.

Ambos requieren definir las mismas variables de entorno del `.env` en el panel
del proveedor.

## Autor

**Luis Felipe Arias Carriazo**
[GitHub](https://github.com/lariasca1994) · [LinkedIn](https://linkedin.com/in/lfac1)
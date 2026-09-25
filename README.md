# ColombiaTech2

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=flat&logo=graphql&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socketdotio&logoColor=white)

Plataforma de alquiler de vivienda con chat en tiempo real entre interesado y
arrendador. Backend unificado en NestJS que expone REST, GraphQL y WebSockets
sobre la misma base de código, con frontend en React.

## Demo en vivo

- **Aplicación:** [colombia-tech2.vercel.app](https://colombia-tech2.vercel.app)
- **API REST:** `https://colombiatech2.onrender.com/api`
- **GraphQL Playground:** `https://colombiatech2.onrender.com/graphql`

> El backend corre en el plan gratuito de Render, que suspende el servicio tras
> un período de inactividad. La primera petición tras la suspensión puede
> tardar entre 30 y 50 segundos en responder mientras el servicio despierta.

## Arquitectura

```mermaid
flowchart TB

    subgraph Usuario["👤 Usuario"]
        Browser["Navegador Web"]
    end

    subgraph Vercel["▲ Vercel"]
        subgraph Frontend["Frontend — React 18 · Vite 6 · TypeScript"]
            App["App.tsx<br/>Polling cada 60 s"]
            APIClient["api.ts<br/>fetch()"]
            Card["ProjectCard"]
            Spark["Sparkline"]
        end
    end

    subgraph Render["☁️ Render (Docker)"]
        subgraph Backend["Backend — FastAPI · Uvicorn"]
            Main["main.py<br/>Rutas REST"]
            Scheduler["APScheduler"]
            Status["status.py"]
            Projects["projects.py"]
            HTTPX["httpx"]
            OracleDriver["oracledb"]
        end
    end

    subgraph OracleCloud["🗄️ Oracle Cloud"]
        ADB["Oracle Autonomous Database<br/>Esquema PORTFOLIO_STATUS"]
    end

    subgraph Externos["🌐 Proyectos del portafolio"]
        P1["Proyecto 1"]
        P2["Proyecto 2"]
        P3["Proyecto N"]
    end

    %% ---- Flujo de datos ----
    Browser -->|HTTPS| App
    App --> APIClient
    App --> Card
    Card --> Spark
    APIClient -->|REST API| Main
    Main --> Projects
    Main --> Status
    Scheduler --> Status
    Status --> HTTPX
    HTTPX -->|GET| P1
    HTTPX -->|GET| P2
    HTTPX -->|GET| P3
    Status --> OracleDriver
    OracleDriver -->|TCPS| ADB
    Main --> OracleDriver

    %% ---- Colores de marca (Brand Colors) ----
    classDef react fill:#61DAFB,stroke:#20232A,stroke-width:2px,color:#20232A;
    classDef vite fill:#BD34FE,stroke:#20232A,stroke-width:2px,color:#FFFFFF;
    classDef typescript fill:#3178C6,stroke:#00273F,stroke-width:2px,color:#FFFFFF;
    classDef fastapi fill:#009688,stroke:#004D40,stroke-width:2px,color:#FFFFFF;
    classDef oracle fill:#F80000,stroke:#7F0000,stroke-width:2px,color:#FFFFFF;
    classDef vercel fill:#000000,stroke:#333333,stroke-width:2px,color:#FFFFFF;
    classDef render fill:#8A05FF,stroke:#4A008C,stroke-width:2px,color:#FFFFFF;
    classDef docker fill:#2496ED,stroke:#0B6FC2,stroke-width:2px,color:#FFFFFF;
    classDef python fill:#3572A5,stroke:#1A3A5C,stroke-width:2px,color:#FFFFFF;
    classDef neutral fill:#F5F5F5,stroke:#CCCCCC,stroke-width:1px,color:#333333;

    class Browser neutral;
    class App,APIClient,Card,Spark react;
    class Main,Scheduler,Status,Projects fastapi;
    class HTTPX,OracleDriver python;
    class ADB oracle;
    class P1,P2,P3 neutral;

    %% ---- Estilos de subgráficos ----
    style Usuario fill:#FAFAFA,stroke:#DDDDDD,stroke-width:1px;
    style Vercel fill:#F0F0F0,stroke:#000000,stroke-width:2px,stroke-dasharray:5 5;
    style Render fill:#F3E8FF,stroke:#8A05FF,stroke-width:2px,stroke-dasharray:5 5;
    style OracleCloud fill:#FFF0F0,stroke:#F80000,stroke-width:2px,stroke-dasharray:5 5;
    style Externos fill:#FFF8E1,stroke:#FFB300,stroke-width:1px,stroke-dasharray:3 3;

    style Frontend fill:#E1F5FE,stroke:#61DAFB,stroke-width:1px;
    style Backend fill:#E0F2F1,stroke:#009688,stroke-width:1px;
```

## Funcionalidades

- Registro e inicio de sesión con JSON Web Tokens
- Publicación y consulta de inmuebles
- Carga de imágenes (avatares y fotos de inmuebles) con almacenamiento
  persistente en la nube
- Acceso restringido: cada usuario solo alcanza su propia información
- Chat en tiempo real mediante WebSockets
- Misma información disponible por REST y por GraphQL

## Arquitectura

```
Cliente (React) ──HTTP/REST──▶ NestJS ──▶ MongoDB
       │         ──GraphQL──▶  (Apollo, code-first)
       └─────────WebSocket───▶  Socket.IO Gateway
```

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
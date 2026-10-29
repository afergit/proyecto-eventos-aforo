# Plataforma de Venta, Reventa Segura y Control de Aforo en Tiempo Real

[![Runtime: Bun](https://img.shields.io/badge/Runtime-Bun%20v1.4+-black?logo=bun)](https://bun.sh/)
[![Backend: Hono](https://img.shields.io/badge/Backend-Hono%20Framework-E36002?logo=hono)](https://hono.dev/)
[![Frontend: Next.js](https://img.shields.io/badge/Frontend-Next.js%20(React)-black?logo=next.js)](https://nextjs.org/)
[![Architecture: Clean Architecture](https://img.shields.io/badge/Architecture-Clean%20%2F%20Hexagonal-blue)](#arquitectura-del-sistema)
[![Testing: Bun Test](https://img.shields.io/badge/Tests-FIRST%20%2F%20AAA%20Pattern-brightgreen)](#calidad-y-testing)

Sistema distribuido diseñado para la venta masiva de entradas, transferencias criptográficas y reventa antifraude, telemetría de aforo en vivo mediante WebSockets y orquestación con agentes de Inteligencia Artificial y Visión Computacional.

---

## 📌 Información Académica
- **Asignatura:** Diseño de Software (TICS316)
- **Product Owner (PO):** Prof. Nicolás Cenzano
- **Modelo de Evaluación:**
  - **70%:** Proceso iterativo de diseño (Commits atómicos, [Bitacora.md](Bitacora.md), Architecture Decision Records - ADRs, [Autoria.md](Autoria.md)).
  - **30%:** Demostración técnica y funcional en vivo.

---

## 🏗️ Arquitectura del Sistema

El proyecto sigue una estructura **Monorepo** con principios de **Clean Architecture (Arquitectura Hexagonal)** para aislar la lógica de dominio de las dependencias externas (bases de datos, frameworks o proveedores cloud):

```
proyecto-eventos-aforo/
├── Bitacora.md                   # Registro de ADRs con justificación de decisiones y trade-offs
├── Autoria.md                    # Registro semanal de autoría, horas y trazabilidad de commits
├── README.md                     # Documentación técnica general
├── .gitignore                    # Reglas de exclusión estricta de artefactos volátiles
├── package.json                  # Definición de Workspaces raíz
│
├── apps/
│   ├── backend/                  # API REST & WebSockets (Bun + Hono)
│   │   ├── src/
│   │   │   ├── domain/           # Entidades, Value Objects y Reglas de Negocio
│   │   │   ├── application/      # Casos de Uso (Purchase, Resell, CheckIn, Capacity)
│   │   │   ├── infrastructure/   # Adaptadores (Postgres, Redis, Azure Blob, Logger)
│   │   │   └── presentation/     # Rutas Hono, Middlewares OWASP y DTOs
│   │   └── tests/                # Pruebas unitarias e integración (FIRST / AAA)
│   └── frontend/                 # Interfaz de Usuario (Next.js + Tailwind + Zustand)
│       └── src/
│           ├── app/              # App Router & Páginas
│           ├── components/       # Componentes visuales accesibles y responsive
│           ├── lib/i18n/         # Motor de Multilenguaje nativo (Zero-External API)
│           └── stores/           # Gestión de estado desacoplada (Zustand)
│
└── packages/
    └── shared/                   # Contratos de tipos y esquemas de validación (Zod)
```

---

## 🚀 Stack Tecnológico

| Capa / Módulo | Tecnología Seleccionada | Justificación Técnica |
|---|---|---|
| **Runtime Backend** | **Bun** | Cold starts instantáneos, I/O ultra veloz, soporte nativo de TypeScript y testing integrado sin compiladores externos. |
| **Framework Backend** | **Hono** | Smart Router de latencia $O(1)$, compatible con estándares web (`Request`/`Response`) y bajo consumo de memoria para alta concurrencia. |
| **Frontend** | **React / Next.js** | Server-Side Rendering (SSR) y Static Site Generation (SSG) para catálogo rápido y SEO. |
| **Diseño y Estilo** | **Tailwind CSS** | Atomic design, 100% responsive y bundle size mínimo. |
| **Gestor de Estado** | **Zustand** | Estado inmutable, liviano, sin boilerplate excesivo y desacoplado del ciclo de render de React. |
| **Internacionalización** | **Native i18n Engine** | Cero APIs externas. Cero latencia y resiliencia offline. |
| **Testing** | **Bun Test** | Ejecución de pruebas unitarias basadas en el patrón AAA y principios FIRST en submilisegundos. |

---

## 🛡️ Seguridad y Calidad (OWASP)
- **Cabeceras de Seguridad:** Implementación de `Content-Security-Policy`, `X-Frame-Options: SAMEORIGIN` y `X-Content-Type-Options: nosniff` en todas las rutas.
- **Validación de Datos:** Validación estricta en el borde mediante esquemas declarativos **Zod**.
- **Trazabilidad:** Logs estructurados en formato **JSON** con `traceId` único por solicitud HTTP.

---

## 🧪 Ejecución de Pruebas

Para ejecutar la suite de pruebas automatizadas con Bun:

```bash
# Ejecutar todas las pruebas del backend
bun --cwd apps/backend test
```

Resultado verificado:
```text
bun test v1.4.4
tests\health.test.ts:
(pass) Suite de Pruebas: Backend Core Foundation (AAA Pattern) > Debe responder 200 OK
(pass) Suite de Pruebas: Backend Core Foundation (AAA Pattern) > Debe incluir cabeceras de seguridad OWASP

 2 pass
 0 fail
 Ran 2 tests across 1 file. [~600ms]
```

---

## 🚦 Roadmap del Proyecto
- [x] **Fase 1:** Infraestructura Base, Monorepo, Hono API, i18n Nativo, SSO Base y ADRs iniciales.
- [ ] **Fase 2:** Identidad, Auth (JWT + Hashing Salt), Azure Blob Storage, Structured Logs.
- [ ] **Fase 3:** Core Transaccional: Concurrencia masiva, Optimistic Locking & Redis.
- [ ] **Fase 4:** Motor de QRs Dinámicos Criptográficos & Reventa Atómica Antifraude.
- [ ] **Fase 5:** Arquitectura Event-Driven (WebSockets) & Telemetría Aforo en Vivo.
- [ ] **Fase 6:** Ecosistema IA: Multi-agente Google ADK + Visión Edge (YOLO/FastVLM).
- [ ] **Fase 7:** Auditoría OWASP Top 10, Cobertura Testing Bun & Demo Técnica.

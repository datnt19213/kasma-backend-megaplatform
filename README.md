# 🚀 Kasma Mega Platform - Backend API

Kasma Backend is a high-performance, scalable, and modular server-side application built with **NestJS**. It serves as the core infrastructure for the Kasma Mega Platform, providing robust authentication, multi-tenancy support, and complex resource management.

---

## 🏗️ System Architecture

The project follows a **Modular Architecture** pattern, emphasizing separation of concerns and maintainability.

### High-Level Architecture

```mermaid
graph TD
    Client[Client Applications] <--> Gateway[API Gateway / Load Balancer]
    Gateway <--> NestJS[NestJS Application]

    subgraph "Backend Core"
        NestJS --> Controllers[Controllers]
        Controllers --> Services[Services]
        Services --> Modules[Modules]
    end

    subgraph "Data Layer"
        Modules --> PG[(PostgreSQL - Primary Data)]
        Modules --> MG[(MongoDB - Audit Logs)]
        Modules --> RD[(Redis - Caching)]
    end

    subgraph "Security & Integration"
        NestJS --> Auth[Auth / JWT / Session]
        NestJS --> RBAC[RBAC / Permissions]
        NestJS --> Middlewares[Cors / Idempotency / Validation]
    end
```

### Key Pillars

- **NestJS Framework**: Leveraging TypeScript for reliable and maintainable code.
- **Hybrid Storage**:
  - **PostgreSQL**: Structured primary data (Users, Tenants, Roles).
  - **MongoDB**: Flexible data requirements and audit logging.
  - **Redis**: Low-latency caching for performance optimization.
- **Multi-Tenancy**: Built-in support for tenant isolation via headers (`X-Tenant-Kasma-Id`).
- **RBAC (Role-Based Access Control)**: Granular permission management across different user roles.

---

## ✨ Core Functionalities

### 🔐 Authentication & Security

- **JWT & Session Based Auth**: Secure user authentication with support for both token-based and session-based flows.
- **Idempotency**: Protects against duplicate requests using specialized interceptors.
- **Global Validation**: Strict input validation using `class-validator` and `ValidationPipe`.
- **CORS Management**: Fine-grained cross-origin resource sharing configuration.

### 🏢 Identity & Access Management (IAM)

- **User Management**: Complete user lifecycle management (Registration, Profile, Credentials).
- **Tenant Management**: Organization/Tenant isolation and specialized access keys.
- **Permission System**: Dynamic role and permission mapping for fine-grained access control.

### 🛠️ Developer Experience

- **Swagger Documentation**: (Optional) Integrated API documentation for easy exploration.
- **Automated Testing**: Robust E2E and unit testing suite using Jest.
- **Standardized Code Style**: Enforced with ESLint and Prettier for consistency.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (v20+)
- **Framework**: [NestJS](https://nestjs.com/)
- **ORM**: [TypeORM](https://typeorm.io/)
- **Databases**:
  - PostgreSQL (Primary)
  - MongoDB (Logging)
  - Redis (Cache)
- **Security**: bcrypt, jsonwebtoken, cookie-parser
- **Validation**: class-validator, class-transformer

---

## 📂 Project Structure

```text
src/
├── common/          # Global decorators, filters, guards, and interceptors
├── config/          # Application and environment configurations
├── database/        # Database connection and module setup
├── dto/             # Data Transfer Objects
├── entities/        # TypeORM entities (PostgreSQL)
├── mongo-entities/  # MongoDB entities
├── modules/         # Core business logic (divided into features like Auth, User, App)
├── shared/          # Shared utilities and services
└── main.ts          # Application entry point
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (Refer to `package.json` for version)
- Yarn or NPM
- Running instances of PostgreSQL, MongoDB, and Redis

### Installation

```bash
yarn install
```

### Environment Setup

Create a `.env` file in the root directory and configure the necessary environment variables (Database URLs, API Keys, etc.).

### Running the App

```bash
# Development mode
yarn dev

# Production build
yarn build
yarn start:prod
```

### Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e
```

---

## 📄 License

This project is **UNLICENSED** and intended for private use.

---

_Maintained by KumoD_

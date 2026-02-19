# Secure File Exchange Gateway (SFTP over HTTPS)

A production-style Node.js service that exposes secure HTTPS APIs to
interact with an SFTP server for regulated file exchange.
This project simulates a real-world NBFC / fintech integration gateway
that handles file operations with strong security, auditing, and
resilience guarantees.

------------------------------------------------------------------------

## 📌 Overview

This service acts as a secure bridge between internal clients and an
SFTP server.
It allows authenticated users to list, download, upload, and manage
files via HTTPS while enforcing strict role-based access control, audit
logging, and operational resilience.

The system is designed to reflect patterns commonly used in NBFCs and
financial institutions for vendor integrations, batch processing, and
regulatory file exchanges.

------------------------------------------------------------------------

## 🚀 Key Features

-   HTTPS-secured Express server
-   Integration with a real SFTP server (Dockerized OpenSSH)
-   JWT-based authentication with role-based access
-   Safe file operations (list, download, upload, create directory)
-   Strict path traversal protection
-   Structured JSON logging for observability
-   Request-level traceability with unique request IDs
-   Compliance-grade audit logging
-   Retry logic for transient SFTP failures
-   Graceful shutdown handling
-   PostgreSQL persistence using Prisma ORM
-   Singleton Prisma client with connection pooling

------------------------------------------------------------------------

## 🧱 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  Client (curl / UI / internal service)                              │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTPS (TLS)
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Node.js Express Gateway                         │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │
│  │  Auth + RBAC  │  │ Audit Logging │  │  Retry Layer  │           │
│  └───────────────┘  └───────────────┘  └───────────────┘           │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ SFTP Client (ssh2-sftp-client)
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Dockerized OpenSSH SFTP Server                         │
│                         File Storage                                │
└─────────────────────────────────────────────────────────────────────┘

Database Layer:
┌──────────────┐     ┌────────────────────┐     ┌──────────────┐
│   Express    │ ──▶ │ Prisma ORM         │ ──▶ │  PostgreSQL  │
│   Gateway    │     │ (Singleton Client) │     │              │
└──────────────┘     └────────────────────┘     └──────────────┘
```

------------------------------------------------------------------------

## 🛠 Tech Stack

### Backend

-   Node.js (ES Modules)
-   Express.js
-   ssh2-sftp-client
-   jsonwebtoken (JWT auth)
-   bcryptjs (password hashing)
-   multer (file uploads)
-   Prisma ORM

### Infrastructure

-   Docker & Docker Compose
-   OpenSSH SFTP Server (containerized)
-   PostgreSQL 15

### Observability & Resilience

-   Structured JSON logging
-   Request ID correlation
-   Retry wrapper for transient failures
-   Graceful shutdown handling

------------------------------------------------------------------------

## 📁 Project Structure

```
sftp-gateway/
├── server/
│   ├── auth/
│   │   ├── auth.routes.ts
│   │   ├── auth.service.ts
│   │   └── jwt.utils.ts
│   ├── middlewares/
│   │   ├── audit.ts
│   │   ├── requireAuth.ts
│   │   └── upload.middleware.ts
│   ├── src/
│   │   ├── db/
│   │   │   └── prisma.ts
│   │   ├── logging/
│   │   │   └── logger.ts
│   │   ├── middlewares/
│   │   │   └── requestId.ts
│   │   ├── repositories/
│   │   │   ├── audit.repo.ts
│   │   │   └── user.repo.ts
│   │   ├── resilience/
│   │   │   └── retry.ts
│   │   ├── routes/
│   │   │   └── files.route.ts
│   │   ├── services/
│   │   │   └── sftp.services.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── path.utils.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── certs/
│   │   ├── cert.pem
│   │   └── key.pem
│   └── package.json
├── sftp-server/
│   ├── Dockerfile
│   └── sshd_config
├── docker-compose.yaml
└── README.md
```

------------------------------------------------------------------------

## 🔐 Security Model

### Authentication

-   JWT-based authentication
-   Tokens issued via `/auth/login`
-   Short-lived access tokens

### Authorization

Role-based access control:

| Role       | Permissions                                    |
|------------|------------------------------------------------|
| READONLY   | List, Download                                 |
| WRITEONLY  | Upload, Create Directory                       |
| ADMIN      | List, Download, Upload, Create Directory       |

### File Safety

-   Path normalization to prevent traversal
-   Restricted to base `/upload` directory
-   Overwrite protection (`flags: 'wx'`)
-   File size limits enforced

------------------------------------------------------------------------

## 🧾 Audit & Compliance Logging

Each file operation generates a structured audit log containing: -
requestId - user - role - action (LIST / DOWNLOAD / UPLOAD / MKDIR) -
file path - HTTP status - timestamp

Logs are emitted in JSON format, ready for ingestion into SIEM systems
(ELK, Splunk, CloudWatch).

------------------------------------------------------------------------

## ⚙️ Setup Instructions

### 1. Clone the Repository

``` bash
git clone <repo-url>
cd sftp-gateway
```

### 2. Start Infrastructure

``` bash
docker compose up --build -d
```

### 3. Configure Environment

Create `server/.env`:

``` env
PORT=8443
JWT_SECRET=replace-with-secure-value

SFTP_HOST=localhost
SFTP_PORT=2222
SFTP_USER=sftpuser
SFTP_PASSWORD=password

DATABASE_URL=postgresql://sftp_user:sftp_pass@localhost:5432/sftp_gateway
```

### 4. Run Database Migrations

``` bash
cd server
npx prisma migrate dev --name init_db
```

### 5. Start the Gateway

``` bash
npm install
npm start
```

Server runs at:

    https://localhost:8443

------------------------------------------------------------------------

## 🔑 Authentication Flow

### Login

``` bash
curl -k https://localhost:8443/auth/login   -H "Content-Type: application/json"   -d '{"username":"reader","password":"reader123"}'
```

Response:

``` json
{
  "token": "<JWT_TOKEN>"
}
```

------------------------------------------------------------------------

## 📂 File Operations API

### List Files

``` bash
curl -k "https://localhost:8443/files/list?path=/upload"   -H "Authorization: Bearer <TOKEN>"
```

### Download File

``` bash
curl -k "https://localhost:8443/files/download?path=/upload/test.txt"   -H "Authorization: Bearer <TOKEN>"   --output test.txt
```

### Upload File

``` bash
curl -k https://localhost:8443/files/upload?path=/upload   -H "Authorization: Bearer <WRITE_TOKEN>"   -F "file=@test.txt"
```

### Create Directory

``` bash
curl -k https://localhost:8443/files/mkdir   -H "Authorization: Bearer <WRITE_TOKEN>"   -H "Content-Type: application/json"   -d '{"path":"/upload/reports"}'
```

------------------------------------------------------------------------

## 🔄 Resilience & Reliability

-   Automatic retry for transient SFTP failures
-   Graceful shutdown on SIGINT/SIGTERM
-   Non-blocking audit writes
-   Safe connection lifecycle handling

------------------------------------------------------------------------

## 🧪 Testing Strategy

Test scenarios covered: - Auth success & failure - Role-based access
enforcement - Unauthorized access attempts - SFTP server downtime and
recovery - Upload size limit enforcement - Graceful shutdown during
operations

------------------------------------------------------------------------

## 🗄 Database Design

### Users Table

Stores authentication credentials and roles.

### AuditLog Table

Stores immutable audit records for all file operations.

Prisma client is implemented as a singleton to ensure efficient
connection pooling and avoid connection storms.

------------------------------------------------------------------------

## 🧠 Design Decisions

-   Express chosen for explicit control and infra-aligned behavior
-   Singleton Prisma client to maintain pooled DB connections
-   Retry wrapper instead of complex circuit breaker (clarity +
    reliability)
-   Structured logging to support compliance and observability
-   Role-based access aligned with internal gateway patterns

------------------------------------------------------------------------

## 🚀 Future Enhancements

-   Streaming uploads (avoid memory buffering)
-   Virus scanning integration hook
-   Rate limiting per user role
-   API key support for machine-to-machine access
-   Centralized error handling middleware
-   Horizontal scaling with shared SFTP backend

------------------------------------------------------------------------

## 📜 License

This project is for educational and demonstration purposes.

------------------------------------------------------------------------

## 👨‍💻 Author

Ankur --- Backend Engineer (SRE → SDE transition focus)
Special interest: Secure integrations, file gateways, and fintech
backend systems.

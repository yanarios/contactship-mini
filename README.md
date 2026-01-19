# 🚀 Smart CRM API (Technical Challenge)

> High-performance Backend API for Lead Management featuring Asynchronous AI Processing, Distributed Caching, and Background Jobs.

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)

## 📋 Overview

This project implements a robust backend architecture for a CRM system. It goes beyond simple CRUD operations by implementing **Event-Driven Architecture** principles to handle resource-intensive tasks (AI Summarization) without blocking the main thread.

### Key Features
* **⚡ Non-Blocking AI Processing:** Uses **Bull (Queue)** and **Redis** to offload Gemini AI interactions to background workers.
* **🐢/⚡ Caching Strategy:** Implements a **Read-Through Cache** mechanism using Redis to minimize database hits and reduce latency.
* **🤖 Automated Sync:** A **Cron Job** periodically fetches and deduplicates leads from external APIs.
* **🛡️ Security:** Protected endpoints via custom **API Key Guards**.
* **🐳 Containerized:** Fully dockerized environment (App + DB + Redis) for easy deployment.

## 🛠️ Architecture Decisions

| Component | Technology | Why? |
| :--- | :--- | :--- |
| **Framework** | NestJS | Modular architecture, dependency injection, and TypeScript support. |
| **Database** | PostgreSQL + TypeORM | Relational integrity and robust ORM for data management. |
| **Queues** | Bull + Redis | To decouple the User Interface from slow AI tasks (Gemini API takes ~3-5s). Ensures immediate API response. |
| **Cache** | Redis | To serve frequently accessed Lead data instantly (sub-millisecond latency). |
| **AI** | Google Gemini | Generates intelligent summaries and "Next Best Action" suggestions for sales leads. |

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* Docker & Docker Compose
* Git

### 1. Clone the repository
```bash
git clone (https://github.com/yanarios/contactship-mini.git)
cd contactship-mini
```
2. Environment Configuration
Create a .env file in the root directory. You can use the example below:

```bash
# Database (Docker Service Name: postgres)
DATABASE_URL=postgres://postgres:postgres@localhost:5432/leads_db

# Redis (Docker Service Name: redis)
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
(ejemplo) API_SECRET_KEY=my-super-secret-key-123

# AI Service
GEMINI_API_KEY=your_google_gemini_api_key_here
```

3. Run with Docker 
This command will start PostgreSQL and Redis containers automatically.

```bash
# Start infrastructure (DB + Redis)
docker-compose up -d

# Install dependencies
npm install

# Run the application in development mode
npm run start:dev
```

The API will be available at http://localhost:3000

## 🔌 API Endpoints

> **Note:** All requests require the header `x-api-key: secret123`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/create-lead` | Register a new lead manually. |
| `GET` | `/leads` | List all leads. |
| `GET` | `/leads/:id` | Get lead details (Uses Cache). |
| `POST` | `/leads/:id/summarize` | **Async:** Triggers AI processing background job. |

## 🧪 Testing the Async Architecture

1.  **Create a Lead** via `POST /create-lead`.
2.  **Request Summary** via `POST /leads/:id/summarize`.
    * *Observation:* The API responds **immediately** with status `processing`.
    * *Background:* The Worker picks up the job, calls Gemini AI, and updates the DB.
3.  **Check Result** via `GET /leads/:id`.
    * *Observation:* The `summary` and `next_action` fields are now populated.



RIOS YANINA GISELE

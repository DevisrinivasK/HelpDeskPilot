# Smart Helpdesk with Agentic Triage

An end-to-end web app for support tickets with AI triage using MERN stack (Track A).

## Project Overview
- **Backend**: Node.js/Express with Mongoose.
- **Frontend**: React with Vite.
- **Database**: MongoDB (containerized with Docker).
- **Agentic Workflow**: Deterministic stub for LLM-like behavior.

## Setup Instructions

### Prerequisites
- Docker and Docker Compose installed.
- Node.js v20+ for local development.

### Running with Docker
1. Copy `.env.example` to `backend/.env` and update if needed.
2. Run `docker compose up -d` to start MongoDB and API.
3. Seed initial data (one-time): Run `docker compose up seed` and then `docker compose rm -f seed`.
4. Verify MongoDB: Connect via `mongodb://localhost:27017/helpdeskpilot` using Compass or shell.
5. Verify API: Visit `http://localhost:8080/healthz` (should return {"status":"healthy","mongodb":"connected"}).
6. Stop with `docker compose down`.

(More instructions to be added in later phases)

(More instructions to be added in later phases)

(More instructions to be added in later phases)

## Architecture
(Diagram and rationale to be added)

## Running the App
(Instructions to be added)

## Testing
(To be added)
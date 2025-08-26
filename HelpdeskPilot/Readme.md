Smart Helpdesk Project
======================

A modern helpdesk application built with the MERN stack (MongoDB, Express.js, React, Node.js) and Docker, featuring user authentication, knowledge base (KB) management, ticket management with role-based access control, and an agentic triage workflow for automated ticket processing. This project supports user roles (user, agent, admin), ticket lifecycle management, and audit logging for tracking actions.

Project Phases
--------------

*   **Phase 0**: Set up project structure with Docker Compose, MongoDB, and Node.js/Express backend.
    
*   **Phase 1**: Configured MongoDB connection and initialized Git repository.
    
*   **Phase 2**: Defined Mongoose schemas for User, Article, Ticket, AgentSuggestion, AuditLog, and Config models.
    
*   **Phase 3**: Created seed script to populate database with sample users, articles, and tickets.
    
*   **Phase 4**: Implemented health check endpoint (/healthz) for API status.
    
*   **Phase 5**: Built user authentication APIs (/api/auth/register, /api/auth/login) with JWT and bcrypt.
    
*   **Phase 6**: Developed KB management APIs for creating, reading, updating, and deleting articles with role-based access.
    
*   **Phase 7**: Implemented ticket management APIs for CRUD operations, role-based access (users create, admins/agents update, admins delete), and audit logging.
    
*   **Phase 8**: Implemented agentic triage workflow for tickets, including classification, KB retrieval, draft reply generation, and auto-resolution using a deterministic stub (STUB\_MODE=true), with audit logging for each step.
    

Prerequisites
-------------

*   **Docker** and **Docker Compose** installed (Docker Desktop for Windows).
    
*   **Node.js** v20+ for local development (optional, as Docker handles runtime).
    
*   **Postman** for API testing.
    
*   **MongoDB Compass** or mongosh for database inspection.
    
*   **Git** for version control.
    

Setup Instructions
------------------

1.  git clone cd HelpdeskPilot
    
2.  **Configure Environment**:
    
    *   cp backend/.env.example backend/.env
        
    *   NODE\_ENV=developmentMONGO\_URI=mongodb://helpdeskpilot-mongo:27017/helpdeskpilotPORT=8080JWT\_SECRET=your-secure-jwt-secret-change-thisSTUB\_MODE=true
        
    *   Replace JWT\_SECRET with a strong, unique secret (e.g., a 32-character random string).
        
3.  **Run with Docker Compose**:
    
    *   docker compose up -d
        
    *   docker compose up seeddocker compose rm -f seed
        
4.  **Verify MongoDB**:
    
    *   docker exec -it helpdeskpilot-mongo mongoshuse helpdeskpilotdb.users.find()
        
    *   Expected: Sample users (admin@example.com, agent@example.com, user@example.com), articles, and tickets.
        
5.  **Verify API**:
    
    *   Check the health endpoint:
        
        *   GET http://localhost:8080/healthz
            
        *   Expected: {"status":"healthy","mongodb":"connected"}
            
6.  **Test Authentication APIs**:
    
    *   Use Postman to test:
        
        *   **Register**: POST http://localhost:8080/api/auth/register
            
            *   Body: { "name": "Test User", "email": "test@example.com", "password": "password123", "role": "user" }
                
            *   Expected: 201 Created, user object.
                
        *   **Login**: POST http://localhost:8080/api/auth/login
            
            *   Body: { "email": "user@example.com", "password": "password3" }
                
            *   Expected: 200 OK, JSON with JWT token.
                
    *   Copy the JWT token from the response for authenticated requests.
        
7.  **Test Knowledge Base APIs**:
    
    *   Use Postman with an admin token (Authorization: Bearer \[admin-token\]):
        
        *   **Search Articles**: GET http://localhost:8080/api/kb?query=billing
            
            *   Expected: 200 OK, array of matching articles.
                
        *   **Create Article**: POST http://localhost:8080/api/kb
            
            *   Headers: Authorization: Bearer \[admin-token\], Content-Type: application/json
                
            *   Body: { "title": "New Article", "body": "Content here...", "tags": \["test"\], "status": "published" }
                
            *   Expected: 201 Created, article object.
                
        *   **Update Article**: PUT http://localhost:8080/api/kb/\[article-id\]
            
            *   Headers: Authorization: Bearer \[admin-token\], Content-Type: application/json
                
            *   Body: { "title": "Updated Article", "body": "Updated content...", "tags": \["test"\], "status": "published" }
                
            *   Expected: 200 OK, updated article.
                
        *   **Delete Article**: DELETE http://localhost:8080/api/kb/\[article-id\]
            
            *   Headers: Authorization: Bearer \[admin-token\]
                
            *   Expected: 204 No Content.
                
    *   Note: POST/PUT/DELETE require admin role.
        
8.  **Test Ticket Management APIs**:
    
    *   Use Postman with appropriate tokens:
        
        *   **Create Ticket** (any authenticated user):
            
            *   POST http://localhost:8080/api/tickets
                
            *   Headers: Authorization: Bearer \[user-token\], Content-Type: application/json
                
            *   Body: { "title": "Billing Issue", "description": "Charged incorrectly for subscription", "category": "billing" }
                
            *   Expected: 201 Created, ticket object (triggers agentic triage in background).
                
        *   **List Tickets** (any authenticated user):
            
            *   GET http://localhost:8080/api/tickets
                
            *   Headers: Authorization: Bearer \[user-token\]
                
            *   Expected: 200 OK, array of tickets (users see own tickets, admins/agents see all).
                
        *   **Get Single Ticket** (any authenticated user):
            
            *   GET http://localhost:8080/api/tickets/\[ticket-id\]
                
            *   Headers: Authorization: Bearer \[user-token\]
                
            *   Expected: 200 OK, ticket object with status (e.g., "resolved" or "waiting\_human" after triage).
                
        *   **Reply to Ticket** (agent only):
            
            *   POST http://localhost:8080/api/tickets/\[ticket-id\]/reply
                
            *   Headers: Authorization: Bearer \[agent-token\], Content-Type: application/json
                
            *   Body: { "reply": "Issue resolved, refund processed", "status": "resolved" }
                
            *   Expected: 200 OK, updated ticket.
                
        *   **Assign Ticket** (admin or agent):
            
            *   POST http://localhost:8080/api/tickets/\[ticket-id\]/assign
                
            *   Headers: Authorization: Bearer \[admin-token\], Content-Type: application/json
                
            *   Body: { "assigneeId": "\[agent-user-id\]" }
                
            *   Expected: 200 OK, updated ticket with assignee.
                
        *   **Audit Logs** (any authenticated user):
            
            *   GET http://localhost:8080/api/tickets/\[ticket-id\]/audit
                
            *   Headers: Authorization: Bearer \[user-token\]
                
            *   Expected: 200 OK, array of audit logs (e.g., TICKET\_TRIAGED\_STARTED, AGENT\_CLASSIFIED, AUTO\_CLOSED).
                
9.  **Stop Services**:
    
    *   docker compose down
        

How Agent Works (Phase 8)
-------------------------

*   **Plan**: Hardcoded state machine: classify -> retrieve -> draft -> decision.
    
*   **Prompts/Tools**: Deterministic stub for classification (keyword-based heuristics) and draft reply (templated with KB references). KB retrieval uses regex search on article title, body, and tags.
    
*   **Guardrails**: Config model defines autoCloseEnabled and confidenceThreshold (default 0.78). Tickets with high confidence (>= 0.78) are auto-resolved; others are assigned to human review (waiting\_human).
    
*   **Testing**: Create a ticket via POST /api/tickets with a description like "I was charged twice, refund please" (triggers billing category, auto-resolves). Check ticket status and audit logs via GET /api/tickets/\[ticket-id\]/audit.
    

Troubleshooting
---------------

*   **MongoDB Connection Issues**:
    
    *   docker logs helpdeskpilot-mongo
        
    *   Ensure MONGO\_URI in .env is mongodb://helpdeskpilot-mongo:27017/helpdeskpilot.
        
    *   docker volume rm helpdeskpilot\_mongo-data
        
*   **API Errors**:
    
    *   docker logs helpdeskpilot-api
        
    *   cd backendnpm install mongoose uuid bcrypt jsonwebtoken
        
    *   docker compose up -d --build
        
*   **Port Conflicts**:
    
    *   netstat -a -n -o | find "8080"
        
    *   taskkill /PID \[PID\] /F
        
*   **No Data in Compass**:
    
    *   docker exec -it helpdeskpilot-mongo mongoshuse helpdeskpilotdb.users.find()
        
    *   docker compose up seeddocker compose rm -f seed
        
*   **Authentication Issues**:
    
    *   Ensure valid JWT token with Bearer prefix.
        
    *   Regenerate token if expired (valid for 1 hour).
        

Next Steps
----------

*   **Phase 9**: Develop React frontend with Vite for user interface, integrating with backend APIs.
    
*   Future phases will enhance agentic features and UI functionality.
    

(Additional phases to be documented as implemented)
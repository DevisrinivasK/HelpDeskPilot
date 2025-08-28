Smart Helpdesk Project
======================

A modern helpdesk application built with the **MERN stack** (MongoDB, Express.js, React, Node.js) and **Docker**, featuring user authentication, knowledge base (KB) management, ticket management with role-based access control (RBAC), and an agentic triage workflow for automated ticket processing. Supports three user roles (user, agent, admin), ticket lifecycle management, and audit logging for tracking actions.

Project Phases
--------------

*   **Phase 0**: Set up project structure with Docker Compose, MongoDB, and Node.js/Express backend.
    
*   **Phase 1**: Configured MongoDB connection and initialized Git repository.
    
*   **Phase 2**: Defined Mongoose schemas for User, Article, Ticket, AgentSuggestion, AuditLog, and Config models.
    
*   **Phase 3**: Created seed script to populate database with sample users, articles, and tickets.
    
*   **Phase 4**: Implemented health check endpoint (/healthz) for API status.
    
*   **Phase 5**: Built user authentication APIs (/api/auth/register, /api/auth/login) with JWT and bcrypt.
    
*   **Phase 6**: Developed KB management APIs for creating, reading, updating, and deleting articles with RBAC.
    
*   **Phase 7**: Implemented ticket management APIs for CRUD operations, RBAC (users create, admins/agents update, admins delete), and audit logging.
    
*   **Phase 8**: Implemented agentic triage workflow for tickets, including classification, KB retrieval, draft reply generation, and auto-resolution using a deterministic stub (STUB\_MODE=true), with audit logging.
    
*   **Phase 9**: Developed React frontend with Vite and Tailwind CSS for user interface, integrating with backend APIs.
    
*   **Phase 10**: Added text index to articles collection for efficient KB search and fixed seed script issues (e.g., user validation, ticket triage).
    
*   **Phase 11**: Tested backend APIs (auth, tickets, KB) with Postman, fixed issues like ObjectId queries, seed imports, and KB text index, and validated audit logs and RBAC.
    

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
        
    *   docker compose up seed && docker compose rm -f seed
        
4.  **Verify MongoDB**:
    
    *   docker exec -it helpdeskpilot-mongo mongoshuse helpdeskpilotdb.users.find()db.articles.find()db.tickets.find()
        
    *   **Expected**: 3 users (admin@example.com, agent@example.com, user@example.com), 3 articles, 3 tickets with audit logs.
        
5.  **Verify API**:
    
    *   GET http://localhost:8080/healthz**Expected**: {"status":"healthy","mongodb":"connected"}
        
6.  **Test Authentication APIs**:
    
    *   Use Postman to test:
        
        *   **Register**: POST http://localhost:8080/api/auth/register
            
            *   Body: {"name":"Test User","email":"test@example.com","password":"password123","role":"user"}
                
            *   **Expected**: 201 Created, user object.
                
        *   **Login**: POST http://localhost:8080/api/auth/login
            
            *   Body: {"email":"user@example.com","password":"password3"}
                
            *   **Expected**: 200 OK, JSON with JWT token.
                
    *   Copy the JWT token for authenticated requests.
        
7.  **Test Knowledge Base APIs**:
    
    *   Use Postman with an admin or user token (Authorization: Bearer ):
        
        *   **Search Articles**: GET http://localhost:8080/api/kb?query=billing
            
            *   **Expected**: 200 OK, array of published articles (e.g., Billing FAQs).
                
        *   **Create Article** (admin/agent only): POST http://localhost:8080/api/kb
            
            *   Headers: Authorization: Bearer , Content-Type: application/json
                
            *   Body: {"title":"New Article","body":"Content here...","tags":\["test"\],"status":"published"}
                
            *   **Expected**: 201 Created, article object.
                
        *   **Update Article** (admin/agent only): PUT http://localhost:8080/api/kb/
            
            *   Headers: Authorization: Bearer , Content-Type: application/json
                
            *   Body: {"title":"Updated Article","body":"Updated content...","tags":\["test"\],"status":"published"}
                
            *   **Expected**: 200 OK, updated article.
                
        *   **Delete Article** (admin only): DELETE http://localhost:8080/api/kb/
            
            *   Headers: Authorization: Bearer
                
            *   **Expected**: 204 No Content.
                
8.  **Test Ticket Management APIs**:
    
    *   Use Postman with appropriate tokens:
        
        *   **Create Ticket** (any authenticated user): POST http://localhost:8080/api/tickets
            
            *   Headers: Authorization: Bearer , Content-Type: application/json
                
            *   Body: {"title":"Billing Issue","description":"Charged incorrectly for subscription","category":"billing"}
                
            *   **Expected**: 201 Created, ticket object (triggers agentic triage).
                
        *   **List Tickets** (any authenticated user): GET http://localhost:8080/api/tickets
            
            *   Headers: Authorization: Bearer
                
            *   **Expected**: 200 OK, array of tickets (users see own tickets, admins/agents see all).
                
        *   **Get Single Ticket** (any authenticated user): GET http://localhost:8080/api/tickets/
            
            *   Headers: Authorization: Bearer
                
            *   **Expected**: 200 OK, ticket object with status (e.g., resolved, waiting\_human).
                
        *   **Reply to Ticket** (agent only): POST http://localhost:8080/api/tickets//reply
            
            *   Headers: Authorization: Bearer , Content-Type: application/json
                
            *   Body: {"reply":"Issue resolved, refund processed","status":"resolved"}
                
            *   **Expected**: 200 OK, updated ticket.
                
        *   **Assign Ticket** (admin/agent): POST http://localhost:8080/api/tickets//assign
            
            *   Headers: Authorization: Bearer , Content-Type: application/json
                
            *   Body: {"assigneeId":""}
                
            *   **Expected**: 200 OK, updated ticket.
                
        *   **Audit Logs** (any authenticated user): GET http://localhost:8080/api/tickets//audit
            
            *   Headers: Authorization: Bearer
                
            *   **Expected**: 200 OK, array of audit logs (e.g., TICKET\_TRIAGED\_STARTED, AGENT\_CLASSIFIED, AUTO\_CLOSED).
                
9.  **Test Frontend**:
    
    *   cd frontendnpm run dev
        
    *   Access at http://localhost:5173.
        
    *   Test login, ticket creation, ticket list, and KB search with Tailwind-styled UI.
        
10.  **Stop Services**:
    
    *   docker compose down
        

How Agent Works (Phase 8)
-------------------------

*   **Plan**: Hardcoded state machine: classify -> retrieve -> draft -> decision.
    
*   **Prompts/Tools**: Deterministic stub (STUB\_MODE=true) for classification (keyword-based heuristics) and draft reply (templated with KB references). KB retrieval uses MongoDB $text search on article title, body, and tags.
    
*   **Guardrails**: Config model defines autoCloseEnabled and confidenceThreshold (default 0.78). Tickets with high confidence (>= 0.78) are auto-resolved; others are set to waiting\_human.
    
*   **Testing**:
    
    *   Create a ticket: POST /api/tickets with {"title":"Billing Issue","description":"Charged twice, refund please","category":"billing"}.
        
    *   Check status and audit logs: GET /api/tickets//audit.
        
    *   **Expected**: Audit logs show triage steps, status is resolved (if confidence >= 0.78) or waiting\_human.
        

Troubleshooting
---------------

*   **MongoDB Connection Issues**:
    
    *   Check logs: docker logs helpdeskpilot-mongo.
        
    *   Verify MONGO\_URI in backend/.env: mongodb://helpdeskpilot-mongo:27017/helpdeskpilot.
        
    *   Reset volume: docker volume rm helpdeskpilot\_mongo-data.
        
*   **API Errors**:
    
    *   Check logs: docker logs helpdeskpilot-api.
        
    *   cd backendnpm install mongoose uuid bcrypt jsonwebtoken
        
    *   Rebuild: docker compose up -d --build.
        
*   **Port Conflicts**:
    
    *   Check: netstat -a -n -o | find "8080".
        
    *   Terminate: taskkill /PID /F.
        
*   **No Data in Compass**:
    
    *   Verify data: docker exec -it helpdeskpilot-mongo mongosh, use helpdeskpilot, db.users.find().
        
    *   Reseed: docker compose up seed && docker compose rm -f seed.
        
*   **Authentication Issues**:
    
    *   Ensure valid JWT with Bearer prefix.
        
    *   Regenerate token if expired (valid for 1 hour).
        
*   **KB Search Issues**:
    
    *   Verify text index: db.articles.getIndexes().
        
    *   Test query: db.articles.find({ $text: { $search: "billing" } }).
        
*   **Ticket Audit Logs Missing**:
    
    *   Check: db.tickets.find() for auditLogs array.
        
    *   Verify triageTicket in backend/src/services/agent.js.
        

Next Steps
----------

*   **Phase 12**: Enhance frontend with advanced features (e.g., ticket status updates, real-time notifications).
    
*   **Phase 13**: Implement automated testing (unit tests for backend, integration tests for APIs).
    
*   **Future Phases**: Add AI-driven triage with LLM integration, improve UI/UX, and deploy to production.
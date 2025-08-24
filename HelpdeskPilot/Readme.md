Smart Helpdesk Project
======================

A modern helpdesk application built with the MERN stack (MongoDB, Express.js, React, Node.js) and Docker, featuring user authentication, knowledge base (KB) management, and ticket management with role-based access control. This project supports user roles (user, agent, admin), ticket lifecycle management, and audit logging for tracking actions.

Project Phases
--------------

*   **Phase 0**: Set up project structure with Docker Compose, MongoDB, and Node.js/Express backend.
    
*   **Phase 1**: Configured MongoDB connection and initialized Git repository.
    
*   **Phase 2**: Defined Mongoose schemas for User, Article, Ticket, and AuditLog models.
    
*   **Phase 3**: Created seed script to populate database with sample users, articles, and tickets.
    
*   **Phase 4**: Implemented health check endpoint (/healthz) for API status.
    
*   **Phase 5**: Built user authentication APIs (/api/auth/register, /api/auth/login) with JWT and bcrypt.
    
*   **Phase 6**: Developed KB management APIs for creating, reading, updating, and deleting articles with role-based access.
    
*   **Phase 7**: Implemented Ticket management APIs for CRUD operations, role-based access (users create, admins/agents update, admins delete), and audit logging.
    

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
        
    *   NODE\_ENV=developmentMONGO\_URI=mongodb://mongo:27017/helpdeskpilotPORT=8080JWT\_SECRET=your\_jwt\_secret\_here
        
3.  **Run with Docker Compose**:
    
    *   docker compose up -d
        
    *   docker compose up seeddocker compose rm -f seed
        
4.  **Verify MongoDB**:
    
    *   docker exec -it helpdeskpilot-mongo mongoshuse helpdeskpilotdb.users.find()
        
    *   Expected: Sample users (admin@example.com, agent@example.com, user@example.com), articles, and tickets.
        
5.  **Verify API**:
    
    *   Check health endpoint: http://localhost:8080/healthz
        
    *   Expected: {"status":"healthy","mongodb":"connected"}
        
6.  **Test Authentication APIs**:
    
    *   Use Postman to test:
        
        *   { "name": "Test User", "email": "test@example.com", "password": "password123", "role": "user"}
            
        *   { "email": "user@example.com", "password": "password3"}
            
    *   Copy the JWT token from the response for authenticated requests.
        
7.  **Test Knowledge Base APIs**:
    
    *   Use Postman with admin token (Authorization: Bearer \[admin-token\]):
        
        *   **Search Articles**: GET http://localhost:8080/api/kb?query=billing
            
        *   { "title": "New Article", "body": "Content here...", "tags": \["test"\], "status": "published"}
            
        *   **Update Article**: PUT http://localhost:8080/api/kb/\[article-id\]
            
        *   **Delete Article**: DELETE http://localhost:8080/api/kb/\[article-id\]
            
    *   Note: POST/PUT/DELETE require admin role.
        
8.  **Test Ticket Management APIs**:
    
    *   Use Postman with appropriate tokens:
        
        *   **Create Ticket** (any authenticated user):
            
            *   POST http://localhost:8080/api/ticket
                
            *   Headers: Authorization: Bearer \[user-token\], Content-Type: application/json
                
            *   { "title": "Billing Issue", "description": "Charged incorrectly for subscription", "category": "billing", "status": "open"}
                
        *   **List Tickets** (any authenticated user):
            
            *   GET http://localhost:8080/api/ticket
                
            *   Headers: Authorization: Bearer \[user-token\]
                
        *   **Get Single Ticket** (any authenticated user):
            
            *   GET http://localhost:8080/api/ticket/\[ticket-id\]
                
            *   Headers: Authorization: Bearer \[user-token\]
                
        *   **Update Ticket** (admin or agent):
            
            *   PUT http://localhost:8080/api/ticket/\[ticket-id\]
                
            *   Headers: Authorization: Bearer \[admin-token\], Content-Type: application/json
                
            *   { "title": "Updated Billing Issue", "description": "Resolved: Refund issued", "category": "billing", "status": "resolved"}
                
        *   **Delete Ticket** (admin only):
            
            *   DELETE http://localhost:8080/api/ticket/\[ticket-id\]
                
            *   Headers: Authorization: Bearer \[admin-token\]
                
    *   **Audit Logs**:
        
        *   docker exec -it helpdeskpilot-mongo mongoshuse helpdeskpilotdb.auditlogs.find()
            
        *   Expected: Entries for ticket creation, updates, and deletion.
            
9.  docker compose down
    

Troubleshooting
---------------

*   **MongoDB Connection Issues**:
    
    *   Check logs: docker logs helpdeskpilot-mongo
        
    *   Ensure MONGO\_URI in .env is correct (mongodb://mongo:27017/helpdeskpilot).
        
    *   Clear volume if needed: docker volume rm helpdeskpilot\_mongo-data
        
*   **API Errors**:
    
    *   Check logs: docker logs helpdeskpilot-api
        
    *   cd backendnpm install mongoose uuid bcrypt jsonwebtoken
        
    *   Rebuild: docker compose up -d --build
        
*   **Port Conflicts**:
    
    *   netstat -a -n -o | find "8080"
        
    *   taskkill /PID \[PID\] /F
        
*   **No Data in Compass**:
    
    *   Refresh Compass or use mongosh to verify collections.
        
    *   docker compose up seeddocker compose rm -f seed
        
*   **Authentication Issues**:
    
    *   Ensure valid JWT token with Bearer prefix.
        
    *   Regenerate token if expired (valid for 1 hour).
        

Next Steps
----------

*   **Phase 8**: Integrate Grok API for agent suggestions to enhance ticket triage.
    
*   Future phases will add React frontend and agentic workflow features.
    

(Additional phases to be documented as implemented)
# HelpdeskPilot

[![Build Status](https://img.shields.io/badge/Build-Passing-green)](https://example.com/build)
[![Dockerized](https://img.shields.io/badge/Dockerized-Yes-blue)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation & Setup](#installation--setup)
- [Architecture & Design](#architecture--design)
- [UML Diagrams](#uml-diagrams)
- [Testing Strategy](#testing-strategy)
- [Deployment Guide](#deployment-guide)
- [Future Enhancements](#future-enhancements)
- [Contributors / License](#contributors--license)

## Introduction
Smart Helpdesk is a modern, Dockerized helpdesk application built with the MERN stack (MongoDB, Express.js, React, Node.js). It provides user authentication, knowledge base (KB) management, ticket management with role-based access control (RBAC) for users, agents, and admins, and an agentic triage workflow for automated ticket processing. Designed for local development and testing, it leverages Docker Compose for a seamless, containerized environment.

## Features
- **User Authentication**: Secure login with JWT and bcrypt for users, agents, and admins.
- **Ticket Management**: CRUD operations with RBAC (users create, agents/admins update, admins delete).
- **Knowledge Base**: Manage articles with text search and RBAC.
- **Agentic Triage**: Automated ticket classification, KB retrieval, and resolution (stub mode).
- **Audit Logging**: Track all actions (e.g., ticket triage, updates).
- **Responsive UI**: React-based frontend with Tailwind CSS.

## System Requirements
### Development Environment
- **Operating System**: Windows 10/11, macOS, or Linux
- **Docker**: v28.x or later (Docker Desktop for Windows)
- **Docker Compose**: v2.x or later
- **Node.js**: v20.x (optional, managed by Docker)
- **Git**: v2.x or later
- **MongoDB Compass**: For database inspection
- **Postman**: For API testing

## Installation & Setup
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/KDevisrinivas/HelpdeskPilot.git
   cd HelpdeskPilot
2.  **Configure Environment**:
    
    *   NODE\_ENV=developmentMONGO\_URI=mongodb://helpdeskpilot-mongo:27017/helpdeskpilotPORT=8080JWT\_SECRET=your-secure-jwt-secret-change-thisSTUB\_MODE=trueAUTO\_CLOSE\_ENABLED=trueCONFIDENCE\_THRESHOLD=0.78
        
    *   Replace JWT\_SECRET with a strong, unique value.
        
3.  docker compose up -d --builddocker compose up seeddocker compose rm -f seed
    
    *   Access at http://localhost:5173.
        

Architecture & Design
---------------------

The application is a monolithic Dockerized setup with three main services: MongoDB, backend API (Express.js with WebSocket), and frontend (React with Vite). Docker Compose orchestrates the containers, ensuring consistent local development. The backend handles API logic, authentication, and triage workflows, while the frontend provides a responsive UI.

UML Diagrams
------------

Below are UML diagrams to visualize the system design.

**Use Case Diagram**  
<img width="1900" height="260" alt="UseCaseDiagram" src="https://github.com/user-attachments/assets/5afb1f20-824c-4393-b49e-a0c255b93214" />

<br><br>

**Class Diagram**  
<img width="575" height="745" alt="ClassDiagram" src="https://github.com/user-attachments/assets/90ee5c60-d436-4cd9-b4e1-019cb5aca7f6" />

<br><br>

**Sequence Diagram**  
<img width="508" height="620" alt="SequenceDiagram" src="https://github.com/user-attachments/assets/8204e73d-46c9-4184-9258-4376acb0b385" />

<br><br>

**Activity Diagram**  
<img width="558" height="398" alt="ActivityDiagram" src="https://github.com/user-attachments/assets/9a60bcfc-d5f8-4d2a-a8a8-019ee3d55098" />

<br><br>

**Component Diagram**  
<img width="615" height="340" alt="ComponentDiagram" src="https://github.com/user-attachments/assets/81f9964a-ed44-448b-8b79-9f950431f27b" />

###Testing Strategy
----------------

*   **API Testing**: Validate backend APIs (auth, tickets, KB) using Postman to ensure CRUD operations, RBAC, and triage workflows function correctly.
    

Deployment Guide
----------------

This is a Dockerized application intended for local development. No external deployment is configured.

*   **Run Locally**: Follow the Installation & Setup steps.
    
*   **Verify**: Use Postman to test APIs and browser to test the UI.
    

Future Enhancements
-------------------

*   **Advanced Triage**: Integrate AI for smarter ticket resolution.
    
*   **Notifications**: Add email or real-time alerts.
    
*   **UI Improvements**: Enhance dashboard and mobile experience.
    

Contributors/ License
---------------------

*   **Author**: K. Devisrinivas
    
*   **License**: MIT License - See LICENSE for details.







# Agile Business Process Modeling

This is a research prototype.

It allows you to:

- Integrate **business process modeling (BPMN)** with agile software development practices
- Visualize **dependencies**, and **process flows**
- Optionally integrate with **Jira** to import and synchronize Agile work items

> This tool is intended as a proof-of-concept to explore how business process models can address common Agile challenges: communicating requirements, planning/prioritizing activities, and managing changes.

---

## Architecture Overview

The project is composed of three main components:

- **Frontend** – Angular application providing the PMDA modeling UI
- **Backend** – Java Spring Boot application offering REST APIs, persistence, and Jira integration
- **Infrastructure** – Dockerized services (database, local email server)

---

## Prerequisites

Before running this application locally, ensure the following tools are installed:

### Docker
- Docker or Docker Desktop
- Docker Compose (included with Docker Desktop)

### Backend (Spring Boot)
- Java **JDK 21**
- Maven (3.x)

### Frontend (Angular)
- Node.js **LTS (20.x)**
- npm **10.x**
- Angular CLI:
  ```bash
  npm install -g @angular/cli

### Jira Integration (Optional)
To enable Jira connectivity, complete the following steps:
1. **Register this application as an OAuth 2.0 application**\
Follow Atlassian's guide [in the "Enabling OAuth 2.0 (3LO)" section](https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/#enabling-oauth-2-0--3lo-).\
**Important:** set the following Callback URL: `http://localhost:4200/profile`

- Configure required environment variables: 
  - `JIRA_CLIENT_ID` - _view this in the Settings section of your created OAuth 2.0 App_
  - `JIRA_CLIENT_SECRET` - _view this in the Settings section of your created OAuth 2.0 App_
  - `JIRA_REDIRECT_URL` - _view this in the Authorization section of your created OAuth 2.0 App below the Callback URL_
  - `JWT_SECRET_KEY` - _a secure secret used for JWT signing (e.g., a 32+ character random string such as "3f8D!s92kL0aPzR7wQm9BnT4cV8yXeZ1")._

---

## Getting Started (Local Setup)

### 1. Clone the Repository

```bash
git clone https://github.com/Agile-BPM/agile-business-process-modeling.git
cd agile-business-process-modeling
```

---

### 2. Start Infrastructure with Docker

```bash
docker compose up -d
```

---

### 3. Start the Backend (Spring Boot)
````bash
cd backend
mvn spring-boot:run
````

The backend will be available at:\
[http://localhost:8088/pmd-agile](http://localhost:8088/pmd-agile)

---

### 4. Start the Frontend (Angular)
Open a new terminal:
```
cd frontend
npm install
ng serve
```

The frontend will be available at:\
[http://localhost:4200](http://localhost:4200)

---

### Email Server
To view emails sent by the application (e.g., for account activation / email verification), access the Email UI at:\
[http://localhost:1080](http://localhost:1080)

---

## Notes
- This tool is a **research prototype**; features may evolve or be experimental.

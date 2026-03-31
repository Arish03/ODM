<div align="center">

# 🛰️ Open Drone Mapping (ODM)
### Precision Aerial Intelligence & Plantation Analytics

**A premium, enterprise-grade GIS platform for processing drone surveys, visualizing tree health, and managing large-scale agricultural inventories.**

[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

[Key Features](#-key-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Deployment](#-deployment) • [Architecture](#-architecture)

</div>

---

## 🌿 Overview

**Open Drone Mapping (ODM)** bridges the gap between raw aerial data and actionable intelligence for the agriculture and forestry sectors. Built for **LanSub Intelligence**, the platform enables administrators to process heavy drone imagery into orthomosaics and vector layers, while providing clients with a stunning, high-performance web interface.

The UI is built on a custom **Green Glassmorphism** design system, ensuring a premium feel that works seamlessly on both desktop monitors and field tablets.

---

## ✨ Key Features

### 🗺️ Advanced Map Visualization
- **Multi-Layer Control:** Toggle between Orthomosaics, DTM (Terrain), and DSM (Surface) models.
- **Dynamic Overlays:** View plantation boundaries, tree locations, and health heatmaps in real-time.
- **Glassmorphic Legend:** Interactive, beautiful legends for height and health scoring.

### 📊 Precision Analytics
- **Tree-Level Intelligence:** Individual tree detection with height and health status.
- **KPI Dashboards:** High-level analytics for total canopy volume, health distribution, and project progress.
- **Chart.js Integration:** Visual data distribution for plantation health audits.

### 🏗️ Enterprise Infrastructure
- **Asynchronous GIS Pipeline:** Heavy geospatial processing (GDAL/PostGIS) handled in the background via Celery.
- **Mobile First:** Fully responsive Sidebar-shell and Map interfaces.
- **Role-Based Access:** Dedicated views for Administrators (survey management) and Clients (data consumption).

---

## 📸 Visual Walkthrough

### 🏠 Admin Dashboard
*Real-time telemetry and fleet management with a forest-glass aesthetic.*
![Admin Dashboard](docs/images/dashboard.png)

### 🏗️ Project Wizard
*Seamless, multi-step drone survey initialization and data upload.*
![Project Wizard](docs/images/wizard.png)

---

---

## 🏗️ Architecture & Dataflow

### 🛰️ System Architecture
The ODM platform follows a distributed, asynchronous GIS processing model.

```mermaid
graph TD
    Client((User / Field Tablet)) --> Frontend[React 19 + MapLibre UI]
    Frontend <--> API[FastAPI Gateway]
    API <--> Auth[JWT Security]
    API <--> PostgreSQL[(PostgreSQL 16 + PostGIS)]
    API <--> Redis[Redis Queue]
    Redis <--> Worker[Celery GIS Engine]
    Worker <--> PostgreSQL
```

### 🛰️ GIS Processing Pipeline
```mermaid
sequenceDiagram
    participant User
    participant React as Frontend
    participant Fast as API
    participant Celery as Worker
    participant GIS as GDAL/GeoPandas
    
    User->>React: Upload Drone Images
    React->>Fast: multipart/form-data
    Fast->>Celery: Queue Processing Job (Redis)
    Celery->>GIS: Generate Orthomosaics
    GIS->>GIS: Detect Canopy (AI/Computer Vision)
    GIS->>Fast: Notify Job Completion
    Fast->>React: Update UI (WebSockets)
    React->>User: Interactive Map Rendered
```

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** React 19 + Vite 6
- **State/Routing:** React Router v7, Context API
- **Maps:** MapLibre GL JS
- **Styling:** Modern Vanilla CSS + Glassmorphism Tokens
- **Icons:** Lucide React

### Backend & AI
- **Core:** Python 3.12 + FastAPI
- **Database:** PostgreSQL 16 + PostGIS
- **Task Queue:** Celery + Redis
- **GIS Engine:** GDAL, GeoPandas, Shapely
- **Auth:** JWT-based Secure Authentication

---

## 🚀 Quick Start (Docker)

The fastest way to deploy the entire stack is using Docker Compose.

### 1. Requirements
- Docker Desktop (Windows/Mac/Linux)
- 8GB RAM minimum (for GIS processing)

### 2. Launching the Stack
From the project root:
```bash
# Build and start all services (DB, Redis, Backend, Worker, Frontend)
docker-compose up --build
```

### 3. Verification
- **Frontend Dashboard:** [http://localhost:5000](http://localhost:5000)
- **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠️ Alternative Setup (Local / Non-Docker)

For development without Docker, follow these steps manually.

### 1. Backend (FastAPI)
Requires Python 3.12, PostgreSQL/PostGIS, and Redis.
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
cp .env.demo .env          # Update with your local DB credentials
uvicorn app.main:app --reload
```

### 2. Frontend (Vite)
Requires Node.js 20+.
```bash
cd frontend
npm install
npm run dev
```

---

---

## ⚙️ Environment Configuration

Both Frontend and Backend use `.env` files for configuration. For local development, you can use the following template:

### `.env.demo` Template
```bash
# ── DB Configuration (PostGIS) ────────────────────────────────────────────────
# For local setup, ensure you include PostgreSQL 16 + PostGIS
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/odm

# ── Redis Configuration (Celery) ──────────────────────────────────────────────
REDIS_URL=redis://localhost:6379/0

# ── Security & Authentication ────────────────────────────────────────────────
SECRET_KEY=lansub_odm_secret_key_8821

# ── Frontend Configuration (Vite) ────────────────────────────────────────────
VITE_API_BASE_URL=http://localhost:8000
```

### Backend (`/backend/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@db:5432/db` |
| `REDIS_URL` | Redis connection string | `redis://redis:6379/0` |
| `SECRET_KEY` | JWT signing key | `[Required for Production]` |

---

## 🌎 Production Considerations

### Nginx Proxy & SSL
The included `frontend/nginx.conf` handles SPA routing. For production:
- Ensure `ports: 443:443` is enabled in `docker-compose.yml`.
- Mount your SSL certificates into the `frontend` container.
- Update the Nginx config to use `ssl_certificate` and `ssl_certificate_key`.

### Background Processing
The `worker` service should be scaled horizontally if processing high volumes of drone imagery.

---

## 🎨 UI Philosophy (Green Glassmorphism)
Our design system focuses on **Depth**, **Transparency**, and **Vibrant Emerald Tones**. All components utilize the `.glass` and `.glass-card` classes defined in `globals.css` to create a harmonious blend between the heavy map data and the UI controls.



---

## 🤝 Contribution & Authors

We welcome contributions from the community to enhance the ODM platform.

**Authors:**
- **Jai** - [jai@lansub.com](mailto:jai@lansub.com)
- **Arish** - [arish@lansub.com](mailto:arish@lansub.com)

**Contact:**
📍 **Lansub Technologies Chennai**  
🌐 [lansub.com](https://lansub.com)  
📧 [info@lansub.com](mailto:info@lansub.com)

<div align="center">
  <sub>Developed by <b>LanSub Intelligence</b>. Proprietary GIS Software.</sub>
</div>
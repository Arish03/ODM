<div align="center">

# 🛰️ Open Drone Mapping (ODM)

**A premium, enterprise-grade full-stack platform for precision drone survey management and GIS analytics.**

[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Docker Deployment](#-docker-deployment) • [Architecture](#-architecture)

</div>

<br />

> **Open Drone Mapping** bridges the gap between raw aerial data and actionable agriculture intelligence. Administrators govern concurrent GIS processing pipelines while clients interact with a stunning **Green Glassmorphism** interface designed for high-precision field analysis.

---

## ✨ Features

- **Immersive Glassmorphic UI:** A premium "Forest-Glass" aesthetic utilizing `backdrop-blur`, emerald tints, and animated aurora backgrounds for a superior SaaS experience.
- **Mobile Responsive Design:** Completely optimized for field use on tablets and smartphones with collapsible map controls and adaptive navigation.
- **Asynchronous GIS Processing:** Process heavy orthomosaics and vector layers (Shapefiles) in the background using Celery and Redis.
- **Interactive Map Engine:** High-performance MapLibre GL integration with health analysis overlays, tree height legends, and dynamic layer control.
- **LanSub Intelligence Branding:** Custom-branded for Open Drone Mapping (ODM) with professional glass logos and integrated iconography.

---

## 🏗️ Tech Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite 6, React Router v7 |
| **Styling & UI** | Vanilla CSS (Modern), Lucide React (Icons) |
| **Mapping Engine**   | MapLibre GL JS |
| **Backend Core** | Python 3.12, FastAPI, SQLAlchemy |
| **Databases** | PostgreSQL + PostGIS, Redis |
| **Task Queue** | Celery Workers |
| **Containerization** | Docker & Docker Compose |

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🐳 Docker Deployment

The fastest way to run the entire ODM stack is via Docker Compose.

```bash
# 1. Build and start all services (Frontend, Backend, Worker, DB, Redis)
docker-compose up --build

# 2. Access the platform
# Frontend: http://localhost:5000
# Backend API: http://localhost:8000
```

---

## 🌿 Design Philosophy
Open Drone Mapping utilizes a **Green Glassmorphism** design system. This focuses on depth, transparency, and a vibrant emerald palette that reflects the agricultural nature of our data. All UI elements adhere to a strict glass token system defined in `globals.css`.

<div align="center">
  <sub>Built with ❤️ by LanSub Intelligence for modern drone operations.</sub>
</div>

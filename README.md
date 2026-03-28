<div align="center">

# 🛰️ Open Drone Map

**A high-performance, full-stack application for drone survey management and GIS analytics.**

[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Celery](https://img.shields.io/badge/Celery-Distributed_Tasks-37814A?style=for-the-badge&logo=celery)](https://docs.celeryq.dev/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Architecture](#-architecture)

</div>

<br />

> **Open Drone Map** bridges the gap between raw drone data and actionable agriculture intelligence. Administrators govern concurrent GIS generation workflows while end-clients interact with beautifully rendered, glassmorphic MapLibre interfaces that visualize crop health and vector layers seamlessly.

---

## ✨ Features

- **Immersive GIS Dashboard:** Utilize MapLibre GL to interact with extremely heavy shapefile layers, custom data density popups, and localized analytics without UI lockups.
- **Premium "Neon-Navy" UI:** A deeply customized Tailwind v4 dark-mode configuration utilizing frosted glass layers (`#111827`), laser-blue accents, and modern user micro-animations.
- **Asynchronous Task Queuing:** Process gigabytes of orthomosaic and vector map overlays in the background natively utilizing Celery and Redis.
- **Dynamic Multi-Step Wizards:** Smooth upload flows keeping clients aware of boundary evaluations and heavy file transfers progressively.

---

## 🏗️ Tech Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend Layout** | React 19, Vite 8, React Router v7 |
| **Frontend Styling** | Tailwind CSS v4, Lucide React (Icons) |
| **Mapping Engine**   | MapLibre GL JS |
| **Backend Core** | Python 3.12, FastAPI, SQLAlchemy |
| **Databases** | PostgreSQL + GeoAlchemy2, Redis |
| **Task Queue** | Celery Workers |
| **Data Processing** | GeoPandas, Shapely |

---

## 🚀 Quick Start

Ensure you have **Node.js 20+**, **Python 3.12+**, and **PostgreSQL (PostGIS)** installed before starting.

### 1. Database & Cache
Ensure your local PostgreSQL database (`plantation_db`) and Redis caching server (`localhost:6379`) are running.

### 2. Backend Setup
Boot the FastAPI application and background workers.

```bash
# Clone the repository and navigate into the backend
cd backend
python -m venv venv

# Activate the virtual environment
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install dependencies and setup environment
pip install -r requirements.txt

# Create your configuration
echo "DATABASE_URL=postgresql://user:password@localhost/plantation_db" > .env
```

Start the primary web server and the Celery background worker in **separate terminals**:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
celery -A app.celery_app worker --loglevel=info --pool=solo
```

### 3. Frontend Setup
Boot the Vite application to proxy connections directly to the Python backend.

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite dev server
npm run dev
```
> The dashboard will immediately be available at **`http://localhost:5173`**.

---

## 🎨 UI Highlight

Open Drone Map utilizes a curated dark canvas focused on visual depth. The design token philosophy centers around distinct layers (`navy` for the root, `card` for boundaries, `elevated` for floaters) separated by explicit `edge` variants to ensure text fields remain completely legible across all high-contrast maps.

<div align="center">
  <sub>Built with ❤️ for modern drone operations.</sub>
</div>

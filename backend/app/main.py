import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response

from app.database import engine, Base
from app.config import get_settings
from app.routers import auth, users, projects, trees, upload

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: wait for DB and create tables
    import time
    from sqlalchemy.exc import OperationalError

    max_retries = 10
    retry_interval = 3
    connected = False

    print("Checking database connection...")
    for i in range(max_retries):
        try:
            Base.metadata.create_all(bind=engine)
            connected = True
            print("Database connected and tables verified.")
            break
        except OperationalError as e:
            print(f"Database not ready (attempt {i+1}/{max_retries}): {e}")
            time.sleep(retry_interval)
        except Exception as e:
            if "duplicate" in str(e).lower() or "already exists" in str(e).lower():
                print(f"Database objects already exist (worker race condition ignored).")
                connected = True
                break
            raise

    if not connected:
        print("Could not connect to database after multiple retries. Exiting.")
        raise RuntimeError("Database connection failed")

    # Auto-seed default users
    from app.seed import seed
    try:
        seed()
    except Exception as e:
        print(f"Seed warning: {e}")

    yield


app = FastAPI(
    title="Plantation & Tree Analytics Dashboard",
    description="GIS-powered plantation management and analytics platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(trees.router)
app.include_router(upload.router)

# Serve generated tiles — return 204 for missing tiles so MapLibre shows nothing
tiles_dir = settings.TILES_DIR
os.makedirs(tiles_dir, exist_ok=True)


@app.get("/tiles/{project_id}/{layer}/{z}/{x}/{y}.png")
async def serve_tile(project_id: str, layer: str, z: int, x: int, y: int):
    tile_path = os.path.join(tiles_dir, project_id, layer, str(z), str(x), f"{y}.png")
    if os.path.isfile(tile_path):
        return FileResponse(tile_path, media_type="image/png", headers={"Cache-Control": "public, max-age=86400"})
    return Response(status_code=204, headers={"Cache-Control": "public, max-age=3600"})


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "plantation-api"}
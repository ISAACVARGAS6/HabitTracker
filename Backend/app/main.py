from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database
from .auth import router as auth_router
from .routes import router as habits_router

# Crear las tablas en la base de datos al iniciar
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Habit Tracker API",
    description="API para seguimiento de hábitos con Turso DB",
    version="1.0.0"
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://10.0.2.2:3000",  # Android Emulator
    "*"  # Permitir todos en desarrollo
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(habits_router, prefix="/habits", tags=["Habits"])

@app.get("/")
def read_root():
    return {
        "message": "🚀 Habit Tracker API está funcionando!",
        "docs": "http://127.0.0.1:8000/docs",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

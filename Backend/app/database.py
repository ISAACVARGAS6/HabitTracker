from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import os
from dotenv import load_dotenv

# Cargar variables del archivo .env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Leer credenciales desde variables de entorno
TURSO_DB_URL = os.getenv("TURSO_DB_URL")
TURSO_AUTH_TOKEN = os.getenv("TURSO_AUTH_TOKEN")

if not TURSO_DB_URL or not TURSO_AUTH_TOKEN:
    raise ValueError("❌ Faltan variables de entorno")

print(f"🔗 Conectando a Turso: {TURSO_DB_URL}")

# Intentar conector libsql experimental
try:
    # Formato para libsql experimental
    DATABASE_URL = f"libsql+http://{TURSO_DB_URL}?authToken={TURSO_AUTH_TOKEN}"
    
    engine = create_engine(
        DATABASE_URL,
        connect_args={},
        pool_pre_ping=True,
        echo=True
    )
    print("✅ Conectado a Turso con libsql")
    
except Exception as e:
    print(f"❌ Error con Turso: {e}")
    print("🔄 Usando SQLite como respaldo...")
    
    # Fallback a SQLite
    DATABASE_URL = "sqlite:///./habits.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
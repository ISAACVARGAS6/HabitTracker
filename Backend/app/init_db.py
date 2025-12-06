import sys
import os

# Agregar el directorio padre al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base, engine
from app import models

def init_database():
    """Función para inicializar la base de datos en Turso"""
    try:
        print("✅ Creando tablas en Turso...")
        Base.metadata.create_all(bind=engine)
        print("🎉 Tablas creadas con éxito en Turso!")
    except Exception as e:
        print(f"❌ Error creando tablas: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    init_database()
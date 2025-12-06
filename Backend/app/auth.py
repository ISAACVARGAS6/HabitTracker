from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError
import os
from . import models, schemas, database

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.getenv("SECRET_KEY", "clave_secreta_para_desarrollo_cambiar_en_produccion")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(database.get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autorizado o token inválido",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError as e:
        print(f"❌ Error JWT: {e}")
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception

    return user

@router.post("/register", response_model=schemas.UserOut)
def register(user_in: schemas.UserCreate, db: Session = Depends(database.get_db)):
    try:
        print(f"🔵 Registrando usuario: {user_in.email}")
        
        if len(user_in.password) > 72:
            raise HTTPException(
                status_code=400,
                detail="La contraseña no puede superar los 72 caracteres"
            )

        existing = db.query(models.User).filter(models.User.email == user_in.email).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail="El email ya está registrado"
            )

        hashed = get_password_hash(user_in.password)
        user = models.User(
            email=user_in.email, 
            password_hash=hashed,
            points=0,
            level=1
        )

        db.add(user)
        db.commit()
        db.refresh(user)
        
        print(f"✅ Usuario registrado: {user.id}")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error en registro: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):
    try:
        print(f"🔵 Intento de login para: {form_data.username}")
        
        user = db.query(models.User).filter(models.User.email == form_data.username).first()
        
        if not user:
            print("❌ Usuario no encontrado")
            raise HTTPException(
                status_code=401,
                detail="Usuario o contraseña incorrectos"
            )
        
        print(f"✅ Usuario encontrado: {user.email}")
        
        if not verify_password(form_data.password, user.password_hash):
            print("❌ Contraseña incorrecta")
            raise HTTPException(
                status_code=401,
                detail="Usuario o contraseña incorrectos"
            )

        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        print(f"✅ Login exitoso para user_id: {user.id}")
        return {"access_token": access_token, "token_type": "bearer"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error en login: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user
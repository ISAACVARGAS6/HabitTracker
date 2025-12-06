from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, date, timedelta
from . import models, schemas, database, auth

router = APIRouter(tags=["habits"])

# --- Funciones auxiliares ---
def get_today_completions(db: Session, habit_id: int, user_id: int):
    today = date.today()
    return db.query(models.HabitCompletion).filter(
        models.HabitCompletion.habit_id == habit_id,
        models.HabitCompletion.user_id == user_id,
        models.HabitCompletion.completed_date == today
    ).count()

def calculate_streak(db: Session, habit_id: int, user_id: int):
    # Calcula la racha actual de días consecutivos
    completions = db.query(models.HabitCompletion.completed_date).filter(
        models.HabitCompletion.habit_id == habit_id,
        models.HabitCompletion.user_id == user_id
    ).order_by(models.HabitCompletion.completed_date.desc()).all()
    
    streak = 0
    current_date = date.today()
    
    for completion in completions:
        if completion.completed_date == current_date:
            streak += 1
            current_date -= timedelta(days=1)
        else:
            break
    
    return streak

# --- Rutas modificadas (sin /habits) ---
@router.get("/", response_model=schemas.DashboardData)  # Cambiado de "/habits" a "/"
def get_habits_dashboard(
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        # Obtener hábitos del usuario
        habits = db.query(models.Habit).filter(models.Habit.user_id == current_user.id).all()
        
        # Enriquecer hábitos con datos del día actual
        enriched_habits = []
        for habit in habits:
            today_completions = get_today_completions(db, habit.id, current_user.id)
            is_completed = today_completions >= habit.target_count
            
            habit_data = schemas.Habit(
                id=habit.id,
                name=habit.name,
                frequency=habit.frequency,
                target_count=habit.target_count,
                points_reward=habit.points_reward,
                color=habit.color,
                completed=habit.completed,
                created_at=habit.created_at,
                user_id=habit.user_id,
                today_completions=today_completions,
                is_completed_today=is_completed
            )
            enriched_habits.append(habit_data)
        
        # Calcular estadísticas del usuario
        total_habits = len(habits)
        completed_today = sum(1 for h in enriched_habits if h.is_completed_today)
        completion_rate = (completed_today / total_habits * 100) if total_habits > 0 else 0
        
        user_stats = schemas.UserStats(
            total_habits=total_habits,
            completed_today=completed_today,
            completion_rate=round(completion_rate, 1),
            current_streak=0,
            longest_streak=0
        )
        
        # Datos para gráficos (últimos 7 días)
        completion_chart = []
        for i in range(7):
            day = date.today() - timedelta(days=6-i)
            day_completions = db.query(models.HabitCompletion).filter(
                models.HabitCompletion.user_id == current_user.id,
                models.HabitCompletion.completed_date == day
            ).count()
            
            completion_chart.append(schemas.CompletionData(
                date=day.strftime("%Y-%m-%d"),
                count=day_completions
            ))
        
        # Progreso por hábito
        progress_data = []
        for habit in habits:
            total_possible = 30
            actual_completions = db.query(models.HabitCompletion).filter(
                models.HabitCompletion.habit_id == habit.id,
                models.HabitCompletion.user_id == current_user.id,
                models.HabitCompletion.completed_date >= date.today() - timedelta(days=30)
            ).count()
            
            completion_rate = (actual_completions / total_possible * 100) if total_possible > 0 else 0
            current_streak = calculate_streak(db, habit.id, current_user.id)
            
            progress_data.append(schemas.HabitProgress(
                habit_id=habit.id,
                habit_name=habit.name,
                completion_rate=round(completion_rate, 1),
                current_streak=current_streak
            ))
        
        return schemas.DashboardData(
            user_stats=user_stats,
            habits=enriched_habits,
            progress_data=progress_data,
            completion_chart=completion_chart
        )
        
    except Exception as e:
        print(f"❌ Error obteniendo dashboard: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.post("/", response_model=schemas.Habit)  # Cambiado de "/habits" a "/"
def create_habit(
    habit_in: schemas.HabitCreate, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        if habit_in.target_count is None:
            habit_in.target_count = 1
        
        if habit_in.points_reward is None:
            habit_in.points_reward = 10
            
        new_habit = models.Habit(
            name=habit_in.name,
            frequency=habit_in.frequency,
            target_count=habit_in.target_count,
            points_reward=habit_in.points_reward,
            color=habit_in.color or "#3B82F6",
            completed=False,
            user_id=current_user.id
        )
        db.add(new_habit)
        db.commit()
        db.refresh(new_habit)
        return new_habit
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creando hábito: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.post("/{habit_id}/complete")  # Cambiado de "/habits/{habit_id}/complete" a "/{habit_id}/complete"
def complete_habit(
    habit_id: int, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        habit = db.query(models.Habit).filter(
            models.Habit.id == habit_id, 
            models.Habit.user_id == current_user.id
        ).first()
        
        if not habit:
            raise HTTPException(status_code=404, detail="Habit not found")
        
        today = date.today()
        today_completions = db.query(models.HabitCompletion).filter(
            models.HabitCompletion.habit_id == habit_id,
            models.HabitCompletion.user_id == current_user.id,
            models.HabitCompletion.completed_date == today
        ).count()
        
        if today_completions >= habit.target_count:
            raise HTTPException(status_code=400, detail="Habit already completed maximum times today")
        
        completion = models.HabitCompletion(
            habit_id=habit_id,
            user_id=current_user.id,
            completed_date=today
        )
        db.add(completion)
        
        if today_completions + 1 >= habit.target_count:
            current_user.points += habit.points_reward
            new_level = current_user.points // 100 + 1
            if new_level > current_user.level:
                current_user.level = new_level
        
        db.commit()
        
        return {
            "message": "Habit completion recorded!",
            "points_earned": habit.points_reward if today_completions + 1 >= habit.target_count else 0,
            "total_points": current_user.points,
            "level": current_user.level,
            "completions_today": today_completions + 1,
            "target_count": habit.target_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error completando hábito: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.delete("/{habit_id}")  # Cambiado de "/habits/{habit_id}" a "/{habit_id}"
def delete_habit(
    habit_id: int, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        habit = db.query(models.Habit).filter(
            models.Habit.id == habit_id, 
            models.Habit.user_id == current_user.id
        ).first()
        
        if not habit:
            raise HTTPException(status_code=404, detail="Habit not found")
        
        db.delete(habit)
        db.commit()
        return {"detail": "Habit deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error eliminando hábito: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/stats")
def get_user_stats(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        total_habits = db.query(models.Habit).filter(
            models.Habit.user_id == current_user.id
        ).count()
        
        total_completions = db.query(models.HabitCompletion).filter(
            models.HabitCompletion.user_id == current_user.id
        ).count()
        
        return {
            "total_habits": total_habits,
            "total_completions": total_completions,
            "points": current_user.points,
            "level": current_user.level
        }
    except Exception as e:
        print(f"❌ Error obteniendo estadísticas: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")
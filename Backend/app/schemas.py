from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import List, Optional

# --- Users ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    points: int
    level: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserStats(BaseModel):
    total_habits: int
    completed_today: int
    completion_rate: float
    current_streak: int
    longest_streak: int

# --- Habits ---
class HabitBase(BaseModel):
    name: str
    frequency: str  # daily, weekly, monthly
    target_count: Optional[int] = 1
    points_reward: Optional[int] = 10
    color: Optional[str] = "#3B82F6"

class HabitCreate(HabitBase):
    pass

class Habit(HabitBase):
    id: int
    completed: bool
    created_at: datetime
    user_id: int
    today_completions: int = 0
    is_completed_today: bool = False

    class Config:
        from_attributes = True

class HabitCompletion(BaseModel):
    id: int
    habit_id: int
    completed_date: date
    created_at: datetime

    class Config:
        from_attributes = True

# --- Dashboard Data ---
class CompletionData(BaseModel):
    date: str
    count: int

class HabitProgress(BaseModel):
    habit_id: int
    habit_name: str
    completion_rate: float
    current_streak: int

class DashboardData(BaseModel):
    user_stats: UserStats
    habits: List[Habit]
    progress_data: List[HabitProgress]
    completion_chart: List[CompletionData]

# --- Token response ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
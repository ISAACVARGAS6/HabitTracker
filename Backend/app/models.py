from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime, date
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    points = Column(Integer, default=0)
    level = Column(Integer, default=1)

    habits = relationship("Habit", back_populates="owner", cascade="all, delete-orphan")
    completions = relationship("HabitCompletion", back_populates="user", cascade="all, delete-orphan")

class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    frequency = Column(String)  # 'daily', 'weekly', 'monthly'
    target_count = Column(Integer, default=1)
    points_reward = Column(Integer, default=10)
    color = Column(String, default="#3B82F6")
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="habits")
    completions = relationship("HabitCompletion", back_populates="habit", cascade="all, delete-orphan")

class HabitCompletion(Base):
    __tablename__ = "habit_completions"

    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    completed_date = Column(Date, default=date.today)
    created_at = Column(DateTime, default=datetime.utcnow)

    habit = relationship("Habit", back_populates="completions")
    user = relationship("User", back_populates="completions")
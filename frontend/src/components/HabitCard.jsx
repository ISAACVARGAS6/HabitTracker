import { useState } from "react";

export default function HabitCard({ habit, onComplete, onDelete }) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleComplete = async () => {
    setIsAnimating(true);
    await onComplete();
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const getFrequencyText = () => {
    const texts = {
      daily: "Diario",
      weekly: "Semanal", 
      monthly: "Mensual"
    };
    return texts[habit.frequency] || habit.frequency;
  };

  const getProgress = () => {
    return (habit.today_completions / habit.target_count) * 100;
  };

  return (
    <div 
      className={`habit-card ${isAnimating ? 'animating' : ''} ${habit.is_completed_today ? 'completed' : ''}`}
      style={{ borderLeftColor: habit.color }}
    >
      <div className="habit-header">
        <h4 className="habit-name">{habit.name}</h4>
        <button onClick={onDelete} className="delete-btn" title="Eliminar hábito">
          🗑️
        </button>
      </div>

      <div className="habit-meta">
        <span className="frequency">{getFrequencyText()}</span>
        <span className="points">+{habit.points_reward} pts</span>
      </div>

      <div className="progress-section">
        <div className="progress-info">
          <span>
            {habit.today_completions}/{habit.target_count} completado
          </span>
          {habit.is_completed_today && (
            <span className="completed-badge">✅ Hecho</span>
          )}
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${getProgress()}%`,
              backgroundColor: habit.color
            }}
          ></div>
        </div>
      </div>

      {!habit.is_completed_today && (
        <button 
          onClick={handleComplete}
          className="complete-btn"
          style={{ backgroundColor: habit.color }}
        >
          {habit.today_completions > 0 ? '➕ Marcar otra vez' : '✅ Completar'}
        </button>
      )}

      <style jsx>{`
        .habit-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          border-left: 4px solid;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }

        .habit-card.completed {
          opacity: 0.8;
          background: #F0FDF4;
        }

        .habit-card.animating {
          animation: bounce 0.5s ease;
        }

        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .habit-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 10px;
        }

        .habit-name {
          margin: 0;
          font-size: 1.1rem;
          color: #1F2937;
        }

        .delete-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
          opacity: 0.6;
          transition: opacity 0.2s;
        }

        .delete-btn:hover {
          opacity: 1;
        }

        .habit-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          font-size: 0.9rem;
          color: #6B7280;
        }

        .points {
          color: #F59E0B;
          font-weight: bold;
        }

        .progress-section {
          margin-bottom: 15px;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.9rem;
        }

        .completed-badge {
          color: #10B981;
          font-weight: bold;
        }

        .progress-bar {
          height: 6px;
          background: #E5E7EB;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .complete-btn {
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
        }

        .complete-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .complete-btn:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}

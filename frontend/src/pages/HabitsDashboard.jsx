import { useState, useEffect } from "react";
import {
  fetchHabitsDashboard,
  completeHabit,
  createHabit,
  deleteHabit,
} from "../api/habits";
import { useAuth } from "../components/AuthContext";
import ProgressChart from "../components/ProgressChart";
import StatsCards from "../components/StatsCards";
import HabitCard from "../components/HabitCard";
import LevelProgress from "../components/LevelProgress";

export default function HabitsDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [newHabit, setNewHabit] = useState({
    name: "",
    frequency: "daily",
    target_count: 1,
    color: "#3B82F6"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { logout, user } = useAuth();

  async function loadDashboard() {
    try {
      setLoading(true);
      const data = await fetchHabitsDashboard();
      setDashboardData(data);
    } catch (err) {
      setError("Error cargando el dashboard");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateHabit(e) {
    e.preventDefault();
    if (!newHabit.name.trim()) return;

    try {
      await createHabit(newHabit);
      setNewHabit({
        name: "",
        frequency: "daily",
        target_count: 1,
        color: "#3B82F6"
      });
      await loadDashboard(); // Recargar datos
    } catch (err) {
      setError("Error creando hábito");
    }
  }

  async function handleCompleteHabit(habitId) {
    try {
      const result = await completeHabit(habitId);
      
      // Mostrar notificación de puntos
      if (result.points_earned > 0) {
        showPointsNotification(result.points_earned);
      }
      
      await loadDashboard(); // Recargar datos
    } catch (err) {
      setError("Error completando hábito");
    }
  }

  async function handleDeleteHabit(habitId) {
    try {
      await deleteHabit(habitId);
      await loadDashboard(); // Recargar datos
    } catch (err) {
      setError("Error eliminando hábito");
    }
  }

  function showPointsNotification(points) {
    const notification = document.createElement('div');
    notification.className = 'points-notification';
    notification.textContent = `+${points} puntos!`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10B981;
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: bold;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  useEffect(() => {
    loadDashboard();
    
    const interval = setInterval(loadDashboard, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando tu progreso...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-error">
        <h2>Error al cargar el dashboard</h2>
        <button onClick={loadDashboard}>Reintentar</button>
      </div>
    );
  }

  const { user_stats, habits, progress_data, completion_chart } = dashboardData;

  return (
    <div className="dashboard-container">
      {/* Contenedor principal completamente centrado */}
      <div className="dashboard-wrapper">
        {/* Header con Nivel y Puntos */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="user-info">
              <h1>🎯 Mi Tablero de Hábitos</h1>
              <LevelProgress 
                level={user_stats.level || 1} 
                points={user_stats.points || 0} 
              />
            </div>
            <button onClick={logout} className="logout-btn">
              Cerrar sesión
            </button>
          </div>
        </header>

        {error && (
          <div className="error-banner">
            <div className="error-content">
              {error}
              <button onClick={() => setError("")}>×</button>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <main className="dashboard-main">
          {/* Tarjetas de Estadísticas */}
          <StatsCards stats={user_stats} />

          <div className="dashboard-content">
            {/* Columna izquierda: Gráficos */}
            <div className="charts-section">
              <div className="chart-card">
                <h3>📈 Progreso Semanal</h3>
                <ProgressChart data={completion_chart} />
              </div>

              <div className="progress-section">
                <h3>🏆 Progreso por Hábito</h3>
                <div className="progress-list">
                  {progress_data.map(progress => (
                    <div key={progress.habit_id} className="progress-item">
                      <div className="progress-info">
                        <span className="habit-name">{progress.habit_name}</span>
                        <span className="completion-rate">
                          {progress.completion_rate}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${Math.min(progress.completion_rate, 100)}%` }}
                        ></div>
                      </div>
                      <div className="streak-badge">
                        🔥 {progress.current_streak} días
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Columna derecha: Hábitos y Formulario */}
            <div className="habits-section">
              {/* Formulario para nuevo hábito */}
              <div className="create-habit-card">
                <h3>➕ Crear Nuevo Hábito</h3>
                <form onSubmit={handleCreateHabit} className="habit-form">
                  <input
                    placeholder="¿Qué hábito quieres desarrollar?"
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                    required
                  />
                  
                  <div className="form-row">
                    <select 
                      value={newHabit.frequency}
                      onChange={(e) => setNewHabit({...newHabit, frequency: e.target.value})}
                    >
                      <option value="daily">Diario</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensual</option>
                    </select>

                    <select 
                      value={newHabit.target_count}
                      onChange={(e) => setNewHabit({...newHabit, target_count: parseInt(e.target.value)})}
                    >
                      <option value="1">1 vez</option>
                      <option value="2">2 veces</option>
                      <option value="3">3 veces</option>
                    </select>

                    <input
                      type="color"
                      value={newHabit.color}
                      onChange={(e) => setNewHabit({...newHabit, color: e.target.value})}
                      title="Color del hábito"
                    />
                  </div>

                  <button type="submit" className="create-btn">
                    Crear Hábito
                  </button>
                </form>
              </div>

              {/* Lista de Hábitos */}
              <div className="habits-list">
                <h3>📝 Mis Hábitos ({habits.length})</h3>
                {habits.length === 0 ? (
                  <div className="empty-state">
                    <p>🎯 Aún no tienes hábitos</p>
                    <small>Crea tu primer hábito para empezar tu journey</small>
                  </div>
                ) : (
                  <div className="habits-grid">
                    {habits.map(habit => (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        onComplete={() => handleCompleteHabit(habit.id)}
                        onDelete={() => handleDeleteHabit(habit.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 20px;
        }

        .dashboard-wrapper {
          width: 100%;
          max-width: 1400px;
          display: flex;
          flex-direction: column;
        }

        .dashboard-header {
          width: 100%;
          margin-bottom: 30px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 15px;
          flex: 1;
        }

        .user-info h1 {
          margin: 0;
          font-size: 2.2rem;
          font-weight: 700;
        }

        .logout-btn {
          background: rgba(255,255,255,0.2);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          white-space: nowrap;
          margin-left: 20px;
        }

        .logout-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-2px);
        }

        .error-banner {
          width: 100%;
          margin-bottom: 20px;
        }

        .error-content {
          background: #EF4444;
          color: white;
          padding: 15px 20px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .error-content button {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dashboard-main {
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        .dashboard-content {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 30px;
          width: 100%;
        }

        .charts-section {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .chart-card, .create-habit-card, .progress-section {
          background: white;
          padding: 25px;
          border-radius: 16px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .chart-card h3, .create-habit-card h3, .progress-section h3 {
          margin: 0 0 20px 0;
          font-size: 1.3rem;
          color: #1F2937;
          font-weight: 600;
        }

        .habit-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .form-row {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .form-row select, .form-row input {
          flex: 1;
        }

        input, select {
          padding: 12px 16px;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        input:focus, select:focus {
          outline: none;
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        input[type="color"] {
          height: 45px;
          padding: 5px;
          cursor: pointer;
        }

        .create-btn {
          background: #10B981;
          color: white;
          border: none;
          padding: 14px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 15px;
          transition: all 0.3s ease;
        }

        .create-btn:hover {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .habits-grid {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .habits-list h3 {
          margin: 0 0 20px 0;
          font-size: 1.3rem;
          color: #1F2937;
          font-weight: 600;
        }

        .empty-state {
          text-align: center;
          padding: 50px 20px;
          color: #6B7280;
          background: #F9FAFB;
          border-radius: 12px;
          border: 2px dashed #D1D5DB;
        }

        .empty-state p {
          margin: 0 0 8px 0;
          font-size: 1.1rem;
          font-weight: 500;
        }

        .empty-state small {
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .progress-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .progress-item {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 15px;
          background: #F8FAFC;
          border-radius: 10px;
          border-left: 4px solid #10B981;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        .habit-name {
          font-weight: 600;
          color: #1F2937;
        }

        .completion-rate {
          font-weight: 700;
          color: #10B981;
          font-size: 15px;
        }

        .progress-bar {
          height: 10px;
          background: #E5E7EB;
          border-radius: 5px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10B981, #34D399);
          transition: width 0.5s ease;
          border-radius: 5px;
        }

        .streak-badge {
          font-size: 12px;
          color: #DC2626;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .dashboard-loading, .dashboard-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          color: white;
          text-align: center;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255,255,255,0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .dashboard-content {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .header-content {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
          
          .logout-btn {
            margin-left: 0;
          }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 15px;
          }
          
          .user-info h1 {
            font-size: 1.8rem;
          }
          
          .form-row {
            flex-direction: column;
          }
          
          .chart-card, .create-habit-card, .progress-section {
            padding: 20px;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
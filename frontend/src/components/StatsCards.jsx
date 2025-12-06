export default function StatsCards({ stats }) {
  const cards = [
    {
      title: "Hábitos Totales",
      value: stats.total_habits,
      icon: "📊",
      color: "#3B82F6"
    },
    {
      title: "Completados Hoy",
      value: stats.completed_today,
      icon: "✅",
      color: "#10B981"
    },
    {
      title: "Tasa de Éxito",
      value: `${stats.completion_rate}%`,
      icon: "🎯",
      color: "#F59E0B"
    },
    {
      title: "Racha Actual",
      value: `${stats.current_streak} días`,
      icon: "🔥",
      color: "#DC2626"
    }
  ];

  return (
    <div className="stats-cards">
      {cards.map((card, index) => (
        <div key={index} className="stat-card" style={{ borderLeftColor: card.color }}>
          <div className="stat-icon">{card.icon}</div>
          <div className="stat-content">
            <div className="stat-value">{card.value}</div>
            <div className="stat-title">{card.title}</div>
          </div>
        </div>
      ))}

      <style jsx>{`
        .stats-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          border-left: 4px solid;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .stat-icon {
          font-size: 2rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #1F2937;
        }

        .stat-title {
          color: #6B7280;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
export default function LevelProgress({ level, points }) {
  const pointsInLevel = points % 100;
  const progress = (pointsInLevel / 100) * 100;

  return (
    <div className="level-progress">
      <div className="level-info">
        <span className="level">Nivel {level}</span>
        <span className="points">{points} puntos</span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="next-level">
        {100 - pointsInLevel} puntos para el nivel {level + 1}
      </div>

      <style jsx>{`
        .level-progress {
          background: rgba(255,255,255,0.1);
          padding: 15px;
          border-radius: 10px;
          backdrop-filter: blur(10px);
        }

        .level-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          color: white;
          font-weight: bold;
        }

        .progress-bar {
          height: 8px;
          background: rgba(255,255,255,0.3);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 5px;
        }

        .progress-fill {
          height: 100%;
          background: #FFD700;
          transition: width 0.3s ease;
        }

        .next-level {
          font-size: 12px;
          color: rgba(255,255,255,0.8);
          text-align: center;
        }
      `}</style>
    </div>
  );
}
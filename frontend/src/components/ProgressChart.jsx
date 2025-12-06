export default function ProgressChart({ data }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="progress-chart">
      <div className="chart-bars">
        {data.map((day, index) => (
          <div key={index} className="chart-bar-container">
            <div className="chart-bar">
              <div 
                className="bar-fill"
                style={{ 
                  height: `${(day.count / maxCount) * 100}%`,
                  backgroundColor: day.count > 0 ? '#10B981' : '#E5E7EB'
                }}
              ></div>
            </div>
            <div className="chart-label">
              {new Date(day.date).toLocaleDateString('es', { weekday: 'short' })}
            </div>
            <div className="chart-value">{day.count}</div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .progress-chart {
          padding: 20px 0;
        }

        .chart-bars {
          display: flex;
          justify-content: space-around;
          align-items: end;
          height: 200px;
        }

        .chart-bar-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .chart-bar {
          height: 150px;
          width: 30px;
          background: #F3F4F6;
          border-radius: 4px;
          display: flex;
          align-items: end;
          position: relative;
        }

        .bar-fill {
          width: 100%;
          border-radius: 4px;
          transition: height 0.3s ease;
          min-height: 4px;
        }

        .chart-label {
          font-size: 12px;
          color: #6B7280;
          text-transform: uppercase;
        }

        .chart-value {
          font-size: 14px;
          font-weight: bold;
          color: #1F2937;
        }
      `}</style>
    </div>
  );
}
import React from 'react';
import { TOPICS } from '../math/generators.js';

export default function SummaryScreen({ stats, onRestart, streak }) {
  const total = stats.correct + stats.wrong;
  const accuracy = total ? Math.round((stats.correct / total) * 100) : 0;
  const fastest = stats.fastest ? `${stats.fastest.toFixed(1)}s` : '—';

  const byTopicSorted = Object.entries(stats.byTopic)
    .map(([id, v]) => ({
      id,
      label: TOPICS[id]?.label || id,
      correct: v.correct,
      wrong: v.wrong,
      total: v.correct + v.wrong,
      acc: v.correct + v.wrong ? Math.round((v.correct / (v.correct + v.wrong)) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const weakest = byTopicSorted.filter((t) => t.total >= 2).sort((a, b) => a.acc - b.acc).slice(0, 3);

  return (
    <div className="screen summary">
      <h1>Nice session</h1>
      {streak > 0 && <div className="streak-banner big">Streak: {streak} day{streak === 1 ? '' : 's'}</div>}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-num">{total}</div>
          <div className="stat-label">answered</div>
        </div>
        <div className="stat-card good">
          <div className="stat-num">{stats.correct}</div>
          <div className="stat-label">correct</div>
        </div>
        <div className="stat-card bad">
          <div className="stat-num">{stats.wrong}</div>
          <div className="stat-label">wrong</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{accuracy}%</div>
          <div className="stat-label">accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{fastest}</div>
          <div className="stat-label">fastest</div>
        </div>
      </div>

      {byTopicSorted.length > 0 && (
        <section className="breakdown">
          <h2>By topic</h2>
          <div className="breakdown-list">
            {byTopicSorted.map((t) => (
              <div key={t.id} className="breakdown-row">
                <span className="br-label">{t.label}</span>
                <span className="br-bar">
                  <span
                    className="br-fill"
                    style={{ width: `${t.acc}%` }}
                  />
                </span>
                <span className="br-nums">{t.correct}/{t.total}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {weakest.length > 0 && (
        <section className="panel tips">
          <h2>Focus areas for tomorrow</h2>
          <ul>
            {weakest.map((t) => (
              <li key={t.id}>
                {t.label}: <strong>{t.acc}%</strong>
              </li>
            ))}
          </ul>
        </section>
      )}

      <button className="btn-start" onClick={onRestart}>Another round</button>
    </div>
  );
}

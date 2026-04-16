import React, { useState, useEffect } from 'react';
import { TOPIC_GROUPS, TOPICS, TOPIC_IDS } from '../math/generators.js';

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
];

const DURATIONS = [
  { seconds: 5 * 60, label: '5 min' },
  { seconds: 10 * 60, label: '10 min' },
  { seconds: 15 * 60, label: '15 min (daily)' },
  { seconds: 20 * 60, label: '20 min' },
];

export default function StartScreen({ onStart, stats }) {
  const [difficulty, setDifficulty] = useState('medium');
  const [duration, setDuration] = useState(15 * 60);
  const [selected, setSelected] = useState(() => new Set(TOPIC_IDS));

  const toggleGroup = (group) => {
    const ids = TOPIC_GROUPS[group];
    const allIn = ids.every((id) => selected.has(id));
    const next = new Set(selected);
    ids.forEach((id) => (allIn ? next.delete(id) : next.add(id)));
    setSelected(next);
  };

  const toggleOne = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const presetAll = () => setSelected(new Set(TOPIC_IDS));
  const presetFractions = () => setSelected(new Set(TOPIC_GROUPS['Fractions']));
  const presetConvert = () => setSelected(new Set(TOPIC_GROUPS['Convert']));

  const canStart = selected.size > 0;

  return (
    <div className="screen start">
      <header className="hero">
        <div className="logo">Math Sprint</div>
        <div className="tagline">Daily practice: fractions, decimals, percents.</div>
      </header>

      {stats && stats.streak > 0 && (
        <div className="streak-banner">
          <strong>{stats.streak}-day streak.</strong> Keep it going.
          {stats.lifetimeQuestions ? ` ${stats.lifetimeQuestions} total answered.` : ''}
        </div>
      )}

      <section className="panel">
        <h2>1. How long?</h2>
        <div className="pill-row">
          {DURATIONS.map((d) => (
            <button
              key={d.seconds}
              className={`pill ${duration === d.seconds ? 'pill-on' : ''}`}
              onClick={() => setDuration(d.seconds)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>2. Difficulty</h2>
        <div className="pill-row">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              className={`pill ${difficulty === d.id ? 'pill-on' : ''}`}
              onClick={() => setDifficulty(d.id)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>3. Topics</h2>
          <div className="preset-row">
            <button className="link-btn" onClick={presetAll}>All</button>
            <button className="link-btn" onClick={presetFractions}>Fractions only</button>
            <button className="link-btn" onClick={presetConvert}>Conversions only</button>
          </div>
        </div>

        {Object.keys(TOPIC_GROUPS).map((group) => {
          const ids = TOPIC_GROUPS[group];
          const all = ids.every((id) => selected.has(id));
          const some = !all && ids.some((id) => selected.has(id));
          return (
            <div key={group} className="topic-group">
              <button
                className={`group-title ${all ? 'on' : some ? 'some' : ''}`}
                onClick={() => toggleGroup(group)}
              >
                {group}
              </button>
              <div className="topic-grid">
                {ids.map((id) => (
                  <button
                    key={id}
                    className={`topic-chip ${selected.has(id) ? 'chip-on' : ''}`}
                    onClick={() => toggleOne(id)}
                  >
                    {TOPICS[id].label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <button
        className="btn-start"
        disabled={!canStart}
        onClick={() => onStart({ topics: Array.from(selected), difficulty, duration })}
      >
        Start {Math.round(duration / 60)}-min sprint
      </button>
    </div>
  );
}

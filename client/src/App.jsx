import React, { useEffect, useState } from 'react';
import StartScreen from './components/StartScreen.jsx';
import GameScreen from './components/GameScreen.jsx';
import SummaryScreen from './components/SummaryScreen.jsx';

const STORAGE_KEY = 'mathsprint.v1';

function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { streak: 0, lastDay: null, lifetimeQuestions: 0, lifetimeCorrect: 0 };
    return JSON.parse(raw);
  } catch {
    return { streak: 0, lastDay: null, lifetimeQuestions: 0, lifetimeCorrect: 0 };
  }
}

function saveStats(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export default function App() {
  const [screen, setScreen] = useState('start');
  const [config, setConfig] = useState(null);
  const [sessionStats, setSessionStats] = useState(null);
  const [persistent, setPersistent] = useState(loadStats);

  const start = (cfg) => {
    setConfig(cfg);
    setSessionStats(null);
    setScreen('game');
  };

  const finish = (stats) => {
    const today = todayKey();
    setPersistent((prev) => {
      let streak = prev.streak;
      if (prev.lastDay === today) {
        // same day, keep streak
      } else if (prev.lastDay === yesterdayKey()) {
        streak = prev.streak + 1;
      } else if ((stats.correct + stats.wrong) > 0) {
        streak = 1;
      }
      const next = {
        streak,
        lastDay: (stats.correct + stats.wrong) > 0 ? today : prev.lastDay,
        lifetimeQuestions: prev.lifetimeQuestions + (stats.correct + stats.wrong),
        lifetimeCorrect: prev.lifetimeCorrect + stats.correct,
      };
      saveStats(next);
      return next;
    });
    setSessionStats(stats);
    setScreen('summary');
  };

  const restart = () => setScreen('start');

  return (
    <div className="app">
      {screen === 'start' && <StartScreen onStart={start} stats={persistent} />}
      {screen === 'game' && config && <GameScreen config={config} onFinish={finish} />}
      {screen === 'summary' && sessionStats && (
        <SummaryScreen stats={sessionStats} onRestart={restart} streak={persistent.streak} />
      )}
      <footer className="footer">Math Sprint · Practice daily</footer>
    </div>
  );
}

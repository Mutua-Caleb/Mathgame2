import React, { useEffect, useState, useRef, useCallback } from 'react';
import QuestionDisplay from './QuestionDisplay.jsx';
import StoryDisplay from './StoryDisplay.jsx';
import { generateQuestion, TOPICS } from '../math/generators.js';

const REVEAL_MS = 1100;

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function renderSolution(q) {
  const s = q.solution;
  if (s && typeof s === 'object' && 'n' in s && 'd' in s) {
    return s.d === 1 ? `${s.n}` : `${s.n}/${s.d}`;
  }
  return String(s);
}

export default function GameScreen({ config, onFinish }) {
  const [question, setQuestion] = useState(() =>
    generateQuestion(config.topics, config.difficulty)
  );
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle'); // idle | correct | wrong
  const [timeLeft, setTimeLeft] = useState(config.duration);
  const [qElapsed, setQElapsed] = useState(0);
  const [stats, setStats] = useState({
    correct: 0,
    wrong: 0,
    answered: 0,
    byTopic: {},
    fastest: null,
  });
  const inputRef = useRef(null);
  const qStart = useRef(Date.now());
  const finishedRef = useRef(false);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [question]);

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
      setQElapsed(Math.floor((Date.now() - qStart.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Keep finish callback seeing latest stats
  useEffect(() => {
    if (timeLeft === 0 && !finishedRef.current) {
      finishedRef.current = true;
      onFinish(stats);
    }
  }, [timeLeft, stats, onFinish]);

  const nextQuestion = useCallback(() => {
    setQuestion(generateQuestion(config.topics, config.difficulty));
    setInput('');
    setStatus('idle');
    qStart.current = Date.now();
    setQElapsed(0);
  }, [config.topics, config.difficulty]);

  const recordAnswer = (correct) => {
    const seconds = (Date.now() - qStart.current) / 1000;
    setStats((s) => {
      const topicKey = question.topicId;
      const topicStats = s.byTopic[topicKey] || { correct: 0, wrong: 0 };
      return {
        correct: s.correct + (correct ? 1 : 0),
        wrong: s.wrong + (correct ? 0 : 1),
        answered: s.answered + 1,
        byTopic: {
          ...s.byTopic,
          [topicKey]: {
            correct: topicStats.correct + (correct ? 1 : 0),
            wrong: topicStats.wrong + (correct ? 0 : 1),
          },
        },
        fastest: correct && (s.fastest === null || seconds < s.fastest) ? seconds : s.fastest,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (status !== 'idle' || !input.trim()) return;
    const correct = question.check(input);
    recordAnswer(correct);
    setStatus(correct ? 'correct' : 'wrong');
    setTimeout(nextQuestion, correct ? 450 : REVEAL_MS);
  };

  const skip = () => {
    if (status !== 'idle') return;
    recordAnswer(false);
    setStatus('wrong');
    setTimeout(nextQuestion, REVEAL_MS);
  };

  const total = stats.correct + stats.wrong;
  const accuracy = total ? Math.round((stats.correct / total) * 100) : 100;
  const qpm = total && (config.duration - timeLeft) > 0
    ? (total / ((config.duration - timeLeft) / 60)).toFixed(1)
    : '—';

  const overTime = qElapsed >= 45;

  return (
    <div className={`screen game status-${status}`}>
      <div className="topbar">
        <div className="timer">
          <span className="timer-label">Time left</span>
          <span className="timer-value">{formatTime(timeLeft)}</span>
        </div>
        <div className="mini-stats">
          <span className="ms ms-good">{stats.correct}</span>
          <span className="ms ms-bad">{stats.wrong}</span>
          <span className="ms">{accuracy}%</span>
          <span className="ms">{qpm}/min</span>
        </div>
        <button className="quit" onClick={() => onFinish(stats)}>End</button>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${((config.duration - timeLeft) / config.duration) * 100}%` }}
        />
      </div>

      <div className="topic-tag">{TOPICS[question.topicId].label}</div>

      {question.story ? (
        <StoryDisplay story={question.story} />
      ) : (
        <QuestionDisplay parts={question.parts} />
      )}

      <form className="answer-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className={`answer-input ${status}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={question.hint}
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          disabled={status !== 'idle'}
        />
        <button type="submit" className="btn-check" disabled={status !== 'idle' || !input.trim()}>
          Check
        </button>
      </form>

      <div className="feedback-row">
        {status === 'correct' && <div className="feedback good">Correct</div>}
        {status === 'wrong' && (
          <div className="feedback bad">
            Answer was <strong>{renderSolution(question)}</strong>
          </div>
        )}
        {status === 'idle' && (
          <div className={`q-timer ${overTime ? 'over' : ''}`}>
            on this question: {qElapsed}s
          </div>
        )}
      </div>

      <div className="bottom-row">
        <button className="skip-btn" onClick={skip} disabled={status !== 'idle'}>
          Skip (show answer)
        </button>
        <div className="format-help">
          Fractions: <code>3/4</code> or <code>1 1/2</code> · Decimals: <code>0.75</code> · Percent: <code>50</code> or <code>50%</code>
        </div>
      </div>
    </div>
  );
}

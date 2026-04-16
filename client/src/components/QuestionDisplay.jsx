import React from 'react';

function StackedFraction({ n, d, bigger }) {
  return (
    <span className={`frac ${bigger ? 'frac-big' : ''}`}>
      <span className="frac-num">{n}</span>
      <span className="frac-bar" />
      <span className="frac-den">{d}</span>
    </span>
  );
}

function MixedDisplay({ w, n, d }) {
  return (
    <span className="mixed">
      <span className="mixed-whole">{w}</span>
      <StackedFraction n={n} d={d} />
    </span>
  );
}

export default function QuestionDisplay({ parts }) {
  return (
    <div className="question">
      {parts.map((p, i) => {
        switch (p.type) {
          case 'num':
            return (
              <span key={i} className="num">
                {p.value}
              </span>
            );
          case 'frac':
            return <StackedFraction key={i} n={p.n} d={p.d} bigger />;
          case 'mixed':
            return <MixedDisplay key={i} w={p.w} n={p.n} d={p.d} />;
          case 'op':
            return (
              <span key={i} className="op">
                {p.value}
              </span>
            );
          case 'text':
            return (
              <span key={i} className="word">
                {p.value}
              </span>
            );
          case 'pct':
            return (
              <span key={i} className="num">
                {p.value}%
              </span>
            );
          case 'frac-blank-num':
            return (
              <span key={i} className="frac frac-big">
                <span className="frac-num frac-hole">?</span>
                <span className="frac-bar" />
                <span className="frac-den">{p.d}</span>
              </span>
            );
          case 'frac-blank-den':
            return (
              <span key={i} className="frac frac-big">
                <span className="frac-num">{p.n}</span>
                <span className="frac-bar" />
                <span className="frac-den frac-hole">?</span>
              </span>
            );
          case 'blank':
            return (
              <span key={i} className="blank">
                ?
              </span>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

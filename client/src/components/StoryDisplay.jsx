import React from 'react';

function InlineFrac({ n, d }) {
  return (
    <span className="frac frac-inline">
      <span className="frac-num">{n}</span>
      <span className="frac-bar" />
      <span className="frac-den">{d}</span>
    </span>
  );
}

export default function StoryDisplay({ story }) {
  return (
    <div className="story">
      {story.map((part, i) => {
        if (part.type === 'frac') return <InlineFrac key={i} n={part.n} d={part.d} />;
        return (
          <span key={i} className="story-text">
            {part.value}
          </span>
        );
      })}
    </div>
  );
}

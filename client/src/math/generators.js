import { WORD_TOPICS } from './wordProblems.js';

export const TOPICS = { ...WORD_TOPICS };

export const TOPIC_IDS = Object.keys(TOPICS);

export const TOPIC_GROUPS = TOPIC_IDS.reduce((acc, id) => {
  const g = TOPICS[id].group;
  (acc[g] = acc[g] || []).push(id);
  return acc;
}, {});

export function generateQuestion(topicIds, difficulty = 'medium') {
  const pool = topicIds && topicIds.length ? topicIds : TOPIC_IDS;
  const id = pool[Math.floor(Math.random() * pool.length)];
  const q = TOPICS[id].gen(difficulty);
  q.topicId = id;
  return q;
}

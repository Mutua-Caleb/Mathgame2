import { TOPICS, TOPIC_IDS, generateQuestion } from '../client/src/math/generators.js';

let failures = 0;
let total = 0;

function renderSolution(q) {
  const s = q.solution;
  if (s && typeof s === 'object' && 'n' in s && 'd' in s) {
    return s.d === 1 ? `${s.n}` : `${s.n}/${s.d}`;
  }
  return String(s);
}

for (const id of TOPIC_IDS) {
  for (const difficulty of ['easy', 'medium', 'hard']) {
    for (let trial = 0; trial < 60; trial++) {
      total++;
      const q = generateQuestion([id], difficulty);
      const sol = renderSolution(q);
      if (!q.check(sol)) {
        failures++;
        if (failures <= 10) {
          console.error(`FAIL ${id} [${difficulty}] solution=${sol}`);
        }
      }
    }
  }
}

console.log(`\n${total - failures}/${total} passed (failures: ${failures})`);
process.exit(failures ? 1 : 0);

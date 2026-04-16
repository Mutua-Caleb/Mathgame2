import { TOPICS } from '../client/src/math/generators.js';

let trials = 0, passed = 0;

function expect(cond, msg) {
  trials++;
  if (cond) passed++; else console.error('FAIL:', msg);
}

// Pull N simplify questions; verify unreduced input is rejected.
for (let i = 0; i < 200; i++) {
  const q = TOPICS['fraction.simplify'].gen('medium');
  const baseN = q.solution.n, baseD = q.solution.d;
  // Correct, reduced
  expect(q.check(`${baseN}/${baseD}`), `simplify accept reduced ${baseN}/${baseD}`);
  // Unreduced multiple
  const unreduced = `${baseN * 2}/${baseD * 2}`;
  expect(!q.check(unreduced), `simplify reject unreduced ${unreduced}`);
}

// Fraction add: equivalent forms accepted
for (let i = 0; i < 200; i++) {
  const q = TOPICS['fraction.add'].gen('medium');
  const s = q.solution;
  if (s.d !== 1) {
    // Double numerator and denominator and accept
    const equiv = `${s.n * 2}/${s.d * 2}`;
    expect(q.check(equiv), `fraction.add accept equivalent ${equiv}`);
  }
}

// Decimal answers accept with small tolerance
for (let i = 0; i < 100; i++) {
  const q = TOPICS['decimal.add'].gen('easy');
  expect(q.check(String(q.solution)), `decimal.add exact ${q.solution}`);
}

// percent.of: accept integer or decimal
for (let i = 0; i < 100; i++) {
  const q = TOPICS['percent.of'].gen('easy');
  const s = q.solution;
  expect(q.check(String(s)), `percent.of value ${s}`);
}

// Compare questions: reject wrong symbol
for (let i = 0; i < 100; i++) {
  const q = TOPICS['fraction.compare'].gen('medium');
  const wrong = q.solution === '<' ? '>' : q.solution === '>' ? '<' : '<';
  expect(!q.check(wrong), `compare reject wrong symbol`);
}

console.log(`${passed}/${trials} passed`);
process.exit(passed === trials ? 0 : 1);

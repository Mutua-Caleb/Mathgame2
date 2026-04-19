import { Fraction, gcd, parseUserFraction, parseUserNumber } from './fraction.js';
import { WORD_TOPICS } from './wordProblems.js';

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const chance = (p) => Math.random() < p;

const SMALL_DENOMS = [2, 3, 4, 5, 6, 8, 10, 12];
const EASY_DENOMS = [2, 3, 4, 5, 6, 10];
const NICE_CONVERT_FRACTIONS = [
  [1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5],
  [1, 10], [3, 10], [7, 10], [9, 10],
  [1, 8], [3, 8], [5, 8], [7, 8],
  [1, 20], [3, 20], [7, 20], [9, 20],
  [1, 25], [3, 25], [7, 25], [11, 25],
  [1, 50], [3, 50], [17, 50],
  [1, 100], [17, 100], [33, 100],
];
const NICE_PERCENTS = [1, 2, 4, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100];

function properFraction(maxDen = 12) {
  const d = pick(SMALL_DENOMS.filter((x) => x <= maxDen));
  const n = rand(1, d - 1);
  return new Fraction(n, d);
}

function mixedFraction(maxWhole = 4, maxDen = 8) {
  const whole = rand(1, maxWhole);
  const d = pick(SMALL_DENOMS.filter((x) => x <= maxDen));
  const n = rand(1, d - 1);
  return new Fraction(whole * d + n, d);
}

function frac(n, d) { return new Fraction(n, d); }

// ---- Display tokens ----
const t = {
  num: (v) => ({ type: 'num', value: v }),
  frac: (n, d) => ({ type: 'frac', n, d }),
  mixed: (w, n, d) => ({ type: 'mixed', w, n, d }),
  op: (value) => ({ type: 'op', value }),
  text: (value) => ({ type: 'text', value }),
  blank: () => ({ type: 'blank' }),
  pct: (v) => ({ type: 'pct', value: v }),
};

function fractionToken(f) {
  if (f.d === 1) return t.num(f.n);
  if (Math.abs(f.n) >= f.d && chance(0.5)) {
    const m = f.toMixedParts();
    if (m.n === 0) return t.num(m.whole);
    return t.mixed(m.whole, m.n, m.d);
  }
  return t.frac(f.n, f.d);
}

// ---- Answer checkers ----
function checkFractionEquivalent(answer) {
  return (input) => {
    const f = parseUserFraction(input);
    if (!f) return false;
    return f.equals(answer);
  };
}

function checkFractionExact(answer) {
  return (input) => {
    const s = input.trim();
    const mixedMatch = s.match(/^(-?)(\d+)\s+(\d+)\/(\d+)$/);
    if (mixedMatch) {
      const sign = mixedMatch[1] === '-' ? -1 : 1;
      const whole = parseInt(mixedMatch[2], 10);
      const n = parseInt(mixedMatch[3], 10);
      const d = parseInt(mixedMatch[4], 10);
      if (d === 0) return false;
      const derived = new Fraction(sign * (whole * d + n), d);
      if (!derived.equals(answer)) return false;
      return n < d && gcd(n, d) === 1;
    }
    const fracMatch = s.match(/^(-?\d+)\/(-?\d+)$/);
    if (fracMatch) {
      const n = parseInt(fracMatch[1], 10);
      const d = parseInt(fracMatch[2], 10);
      if (d === 0) return false;
      if (gcd(Math.abs(n), Math.abs(d)) !== 1) return false;
      return new Fraction(n, d).equals(answer);
    }
    if (/^-?\d+$/.test(s) && answer.d === 1) {
      return parseInt(s, 10) === answer.n;
    }
    return false;
  };
}

function checkDecimal(answer, tol = 1e-6) {
  return (input) => {
    const v = parseUserNumber(input);
    if (v === null) return false;
    return Math.abs(v - answer) <= tol;
  };
}

function checkPercent(answer, tol = 1e-6) {
  return (input) => {
    const s = input.trim();
    const hadPct = s.endsWith('%');
    const v = parseUserNumber(hadPct ? s.slice(0, -1) : s);
    if (v === null) return false;
    return Math.abs(v - answer) <= tol;
  };
}

function checkInteger(answer) {
  return (input) => {
    const s = input.trim();
    if (!/^-?\d+$/.test(s)) return false;
    return parseInt(s, 10) === answer;
  };
}

function checkComparison(answer) {
  return (input) => {
    const s = input.trim();
    if (s === answer) return true;
    if (answer === '=' && (s === '==' || s.toLowerCase() === 'eq')) return true;
    return false;
  };
}

// ==================================================================
// GENERATORS
// ==================================================================

function genFractionAdd(difficulty) {
  const useMixed = difficulty === 'hard' && chance(0.5);
  const sameDen = difficulty === 'easy' && chance(0.6);
  let a, b;
  if (useMixed) {
    a = mixedFraction(3, 6);
    b = mixedFraction(2, 6);
  } else if (sameDen) {
    const d = pick(EASY_DENOMS);
    a = new Fraction(rand(1, d - 1), d);
    b = new Fraction(rand(1, d - 1), d);
  } else {
    a = properFraction(difficulty === 'easy' ? 6 : 10);
    b = properFraction(difficulty === 'easy' ? 6 : 10);
  }
  const ans = a.add(b);
  return {
    topic: 'Fraction addition',
    parts: [fractionToken(a), t.op('+'), fractionToken(b), t.op('='), t.blank()],
    hint: 'Simplest form, e.g. 3/4 or 1 1/2',
    check: checkFractionEquivalent(ans),
    solution: ans,
  };
}

function genFractionSub(difficulty) {
  let a, b;
  const useMixed = difficulty === 'hard' && chance(0.5);
  if (useMixed) {
    a = mixedFraction(4, 6);
    b = mixedFraction(2, 6);
    if (b.toDecimal() > a.toDecimal()) [a, b] = [b, a];
  } else {
    do {
      a = properFraction(difficulty === 'easy' ? 6 : 10);
      b = properFraction(difficulty === 'easy' ? 6 : 10);
    } while (b.toDecimal() > a.toDecimal());
  }
  const ans = a.sub(b);
  return {
    topic: 'Fraction subtraction',
    parts: [fractionToken(a), t.op('−'), fractionToken(b), t.op('='), t.blank()],
    hint: 'Simplest form',
    check: checkFractionEquivalent(ans),
    solution: ans,
  };
}

function genFractionMul(difficulty) {
  const kind = difficulty === 'easy'
    ? pick(['ff', 'fw'])
    : pick(['ff', 'fw', 'ff', 'of']);
  let a, b;
  if (kind === 'fw') {
    a = properFraction(difficulty === 'easy' ? 6 : 10);
    b = new Fraction(rand(2, difficulty === 'easy' ? 9 : 15));
  } else if (kind === 'of') {
    a = properFraction(difficulty === 'easy' ? 6 : 10);
    const whole = rand(2, 12) * a.d;
    b = new Fraction(whole);
    const ans = a.mul(b);
    return {
      topic: 'Fraction of a quantity',
      parts: [fractionToken(a), t.text('of'), t.num(whole), t.op('='), t.blank()],
      hint: 'Answer as a whole number',
      check: checkInteger(ans.n),
      solution: ans,
    };
  } else {
    a = properFraction(difficulty === 'easy' ? 6 : 10);
    b = properFraction(difficulty === 'easy' ? 6 : 10);
  }
  const ans = a.mul(b);
  return {
    topic: 'Fraction multiplication',
    parts: [fractionToken(a), t.op('×'), fractionToken(b), t.op('='), t.blank()],
    hint: 'Simplest form',
    check: checkFractionEquivalent(ans),
    solution: ans,
  };
}

function genFractionDiv(difficulty) {
  const kind = difficulty === 'easy' ? 'ff' : pick(['ff', 'wf', 'ff']);
  let a, b;
  if (kind === 'wf') {
    a = new Fraction(rand(2, 10));
    b = properFraction(difficulty === 'easy' ? 6 : 8);
  } else {
    a = properFraction(difficulty === 'easy' ? 6 : 10);
    b = properFraction(difficulty === 'easy' ? 6 : 10);
  }
  const ans = a.div(b);
  return {
    topic: 'Fraction division',
    parts: [fractionToken(a), t.op('÷'), fractionToken(b), t.op('='), t.blank()],
    hint: 'Simplest form, mixed numbers ok',
    check: checkFractionEquivalent(ans),
    solution: ans,
  };
}

function genFractionSimplify(difficulty) {
  const base = properFraction(difficulty === 'easy' ? 6 : 10);
  const mult = rand(2, difficulty === 'easy' ? 4 : 7);
  const bigN = base.n * mult;
  const bigD = base.d * mult;
  return {
    topic: 'Simplify fraction',
    parts: [t.text('Simplify'), t.frac(bigN, bigD), t.op('='), t.blank()],
    hint: 'Fully reduced form',
    check: checkFractionExact(base),
    solution: base,
  };
}

function genFractionEquivalent(difficulty) {
  const base = properFraction(difficulty === 'easy' ? 6 : 10);
  const mult = rand(2, difficulty === 'easy' ? 5 : 9);
  const targetDen = base.d * mult;
  const targetNum = base.n * mult;
  const hideNum = chance(0.5);
  return {
    topic: 'Equivalent fractions',
    parts: [
      t.frac(base.n, base.d),
      t.op('='),
      hideNum ? { type: 'frac-blank-num', d: targetDen } : { type: 'frac-blank-den', n: targetNum },
    ],
    hint: hideNum ? 'Missing numerator (whole number)' : 'Missing denominator (whole number)',
    check: checkInteger(hideNum ? targetNum : targetDen),
    solution: hideNum ? targetNum : targetDen,
  };
}

function genFractionCompare(difficulty) {
  const a = properFraction(difficulty === 'easy' ? 6 : 10);
  let b;
  do {
    b = properFraction(difficulty === 'easy' ? 6 : 10);
  } while (a.equals(b) && Math.random() < 0.7);
  const ans = a.toDecimal() < b.toDecimal() ? '<' : a.toDecimal() > b.toDecimal() ? '>' : '=';
  return {
    topic: 'Compare fractions',
    parts: [fractionToken(a), t.blank(), fractionToken(b)],
    hint: 'Type <, >, or =',
    check: checkComparison(ans),
    solution: ans,
  };
}

function genDecimalAdd(difficulty) {
  const places = difficulty === 'hard' ? pick([1, 2, 2, 3]) : pick([1, 2]);
  const mult = Math.pow(10, places);
  const a = rand(1, 99 * (difficulty === 'easy' ? 1 : 2)) / mult;
  const b = rand(1, 99 * (difficulty === 'easy' ? 1 : 2)) / mult;
  const ans = Number((a + b).toFixed(places + 1));
  return {
    topic: 'Decimal addition',
    parts: [t.num(a.toFixed(places)), t.op('+'), t.num(b.toFixed(places)), t.op('='), t.blank()],
    hint: 'Decimal number',
    check: checkDecimal(ans),
    solution: ans,
  };
}

function genDecimalSub(difficulty) {
  const places = difficulty === 'hard' ? pick([1, 2, 2, 3]) : pick([1, 2]);
  const mult = Math.pow(10, places);
  let a = rand(30, 99 * (difficulty === 'easy' ? 1 : 3)) / mult;
  let b = rand(1, 29 * (difficulty === 'easy' ? 1 : 3)) / mult;
  if (b > a) [a, b] = [b, a];
  const ans = Number((a - b).toFixed(places + 1));
  return {
    topic: 'Decimal subtraction',
    parts: [t.num(a.toFixed(places)), t.op('−'), t.num(b.toFixed(places)), t.op('='), t.blank()],
    hint: 'Decimal number',
    check: checkDecimal(ans),
    solution: ans,
  };
}

function genDecimalMul(difficulty) {
  const a = rand(2, difficulty === 'easy' ? 9 : 20) / 10;
  const b = difficulty === 'hard' ? rand(2, 15) / (chance(0.5) ? 10 : 100) : rand(2, 12);
  const ans = Number((a * b).toFixed(6));
  const aStr = a.toString();
  const bStr = b.toString();
  return {
    topic: 'Decimal multiplication',
    parts: [t.num(aStr), t.op('×'), t.num(bStr), t.op('='), t.blank()],
    hint: 'Decimal number',
    check: checkDecimal(ans),
    solution: ans,
  };
}

function genDecimalDiv(difficulty) {
  const bWhole = rand(2, difficulty === 'easy' ? 6 : 12);
  const aWhole = bWhole * rand(2, 12);
  const tenths = difficulty === 'easy' ? 10 : pick([10, 100]);
  const a = aWhole / tenths;
  const ans = Number((a / bWhole).toFixed(6));
  return {
    topic: 'Decimal division',
    parts: [t.num(a.toString()), t.op('÷'), t.num(bWhole.toString()), t.op('='), t.blank()],
    hint: 'Decimal number',
    check: checkDecimal(ans),
    solution: ans,
  };
}

function genDecimalScale(difficulty) {
  const scale = pick([10, 100, 1000]);
  const op = chance(0.5) ? '×' : '÷';
  const places = difficulty === 'easy' ? pick([1, 2]) : pick([1, 2, 3]);
  const mult = Math.pow(10, places);
  const base = rand(1, 999) / mult;
  const ans = op === '×' ? base * scale : base / scale;
  return {
    topic: 'Decimal scaling',
    parts: [t.num(base.toString()), t.op(op), t.num(scale.toString()), t.op('='), t.blank()],
    hint: 'Decimal number',
    check: checkDecimal(Number(ans.toFixed(6))),
    solution: Number(ans.toFixed(6)),
  };
}

function genDecimalRound(difficulty) {
  const places = pick([1, 2, 3]);
  const sourcePlaces = places + pick([1, 2]);
  const num = rand(1, 9999) / Math.pow(10, sourcePlaces);
  const mult = Math.pow(10, places);
  const rounded = Math.round(num * mult) / mult;
  const labels = { 1: 'tenth', 2: 'hundredth', 3: 'thousandth' };
  return {
    topic: 'Rounding decimals',
    parts: [
      t.text('Round'),
      t.num(num.toFixed(sourcePlaces)),
      t.text(`to nearest ${labels[places]}`),
      t.op('='),
      t.blank(),
    ],
    hint: `Decimal with ${places} place${places > 1 ? 's' : ''}`,
    check: checkDecimal(rounded, 1e-6),
    solution: rounded,
  };
}

function genDecimalCompare(difficulty) {
  const places = difficulty === 'easy' ? 1 : pick([2, 3]);
  const mult = Math.pow(10, places);
  const a = rand(1, 999) / mult;
  const b = rand(1, 999) / mult;
  const ans = a < b ? '<' : a > b ? '>' : '=';
  return {
    topic: 'Compare decimals',
    parts: [t.num(a.toString()), t.blank(), t.num(b.toString())],
    hint: 'Type <, >, or =',
    check: checkComparison(ans),
    solution: ans,
  };
}

function genPercentOf(difficulty) {
  let pct, whole;
  if (difficulty === 'easy') {
    pct = pick([10, 20, 25, 50, 75, 100]);
    whole = rand(2, 20) * 10;
  } else {
    pct = pick(NICE_PERCENTS);
    whole = rand(2, 50) * pick([4, 5, 10, 20]);
  }
  const ans = (pct / 100) * whole;
  const niceAns = Number(ans.toFixed(3));
  return {
    topic: 'Percentage of a quantity',
    parts: [t.pct(pct), t.text('of'), t.num(whole), t.op('='), t.blank()],
    hint: 'Number answer',
    check: checkDecimal(niceAns),
    solution: niceAns,
  };
}

function genPercentExpress(difficulty) {
  const whole = pick([20, 25, 40, 50, 100, 200]);
  const pct = pick(NICE_PERCENTS.filter((p) => p <= 100));
  const part = Math.round((pct / 100) * whole);
  const actualPct = (part / whole) * 100;
  return {
    topic: 'Express as a percentage',
    parts: [
      t.text('What % is'),
      t.num(part),
      t.text('of'),
      t.num(whole),
      t.op('='),
      t.blank(),
    ],
    hint: 'Type the number (with or without %)',
    check: checkPercent(actualPct, 0.01),
    solution: `${actualPct}%`,
  };
}

function genFracToDec() {
  const [n, d] = pick(NICE_CONVERT_FRACTIONS);
  const f = new Fraction(n, d);
  const dec = Number((n / d).toFixed(6));
  return {
    topic: 'Fraction → Decimal',
    parts: [t.text('Convert'), t.frac(n, d), t.text('to decimal'), t.op('='), t.blank()],
    hint: 'Decimal answer',
    check: checkDecimal(dec, 1e-6),
    solution: dec,
  };
}

function genDecToFrac() {
  const [n, d] = pick(NICE_CONVERT_FRACTIONS);
  const dec = Number((n / d).toFixed(6));
  return {
    topic: 'Decimal → Fraction',
    parts: [t.text('Convert'), t.num(dec.toString()), t.text('to fraction'), t.op('='), t.blank()],
    hint: 'Simplest form fraction a/b',
    check: checkFractionExact(new Fraction(n, d)),
    solution: `${n}/${d}`,
  };
}

function genFracToPct() {
  const [n, d] = pick(NICE_CONVERT_FRACTIONS);
  const pct = Number(((n / d) * 100).toFixed(4));
  return {
    topic: 'Fraction → Percent',
    parts: [t.text('Convert'), t.frac(n, d), t.text('to %'), t.op('='), t.blank()],
    hint: 'Percent (with or without %)',
    check: checkPercent(pct, 0.01),
    solution: `${pct}%`,
  };
}

function genPctToFrac() {
  const pcts = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 4, 8, 12, 36, 64, 125, 1, 2];
  const p = pick(pcts);
  const f = new Fraction(p, 100);
  return {
    topic: 'Percent → Fraction',
    parts: [t.text('Convert'), t.pct(p), t.text('to fraction'), t.op('='), t.blank()],
    hint: 'Simplest form fraction',
    check: checkFractionExact(f),
    solution: f.toString(),
  };
}

function genDecToPct() {
  const places = pick([1, 2]);
  const mult = Math.pow(10, places);
  const dec = rand(1, 99) / mult;
  const pct = Number((dec * 100).toFixed(3));
  return {
    topic: 'Decimal → Percent',
    parts: [t.text('Convert'), t.num(dec.toString()), t.text('to %'), t.op('='), t.blank()],
    hint: 'Percent (with or without %)',
    check: checkPercent(pct, 0.001),
    solution: `${pct}%`,
  };
}

function genPctToDec() {
  const p = pick([1, 2, 5, 7, 10, 12, 15, 20, 25, 33, 45, 50, 66, 75, 80, 95, 99, 125, 200]);
  const dec = Number((p / 100).toFixed(4));
  return {
    topic: 'Percent → Decimal',
    parts: [t.text('Convert'), t.pct(p), t.text('to decimal'), t.op('='), t.blank()],
    hint: 'Decimal answer',
    check: checkDecimal(dec, 1e-6),
    solution: dec,
  };
}

// ==================================================================
// Topic registry
// ==================================================================

export const TOPICS = {
  'fraction.add': { label: 'Fractions: add', gen: genFractionAdd, group: 'Fractions' },
  'fraction.sub': { label: 'Fractions: subtract', gen: genFractionSub, group: 'Fractions' },
  'fraction.mul': { label: 'Fractions: multiply', gen: genFractionMul, group: 'Fractions' },
  'fraction.div': { label: 'Fractions: divide', gen: genFractionDiv, group: 'Fractions' },
  'fraction.simplify': { label: 'Simplify fractions', gen: genFractionSimplify, group: 'Fractions' },
  'fraction.equivalent': { label: 'Equivalent fractions', gen: genFractionEquivalent, group: 'Fractions' },
  'fraction.compare': { label: 'Compare fractions', gen: genFractionCompare, group: 'Fractions' },
  'decimal.add': { label: 'Decimals: add', gen: genDecimalAdd, group: 'Decimals' },
  'decimal.sub': { label: 'Decimals: subtract', gen: genDecimalSub, group: 'Decimals' },
  'decimal.mul': { label: 'Decimals: multiply', gen: genDecimalMul, group: 'Decimals' },
  'decimal.div': { label: 'Decimals: divide', gen: genDecimalDiv, group: 'Decimals' },
  'decimal.scale': { label: 'Decimals: × ÷ 10/100/1000', gen: genDecimalScale, group: 'Decimals' },
  'decimal.round': { label: 'Round decimals', gen: genDecimalRound, group: 'Decimals' },
  'decimal.compare': { label: 'Compare decimals', gen: genDecimalCompare, group: 'Decimals' },
  'percent.of': { label: 'Percent of a number', gen: genPercentOf, group: 'Percent' },
  'percent.express': { label: 'Express as percent', gen: genPercentExpress, group: 'Percent' },
  'convert.frac_to_dec': { label: 'Fraction → Decimal', gen: genFracToDec, group: 'Convert' },
  'convert.dec_to_frac': { label: 'Decimal → Fraction', gen: genDecToFrac, group: 'Convert' },
  'convert.frac_to_pct': { label: 'Fraction → %', gen: genFracToPct, group: 'Convert' },
  'convert.pct_to_frac': { label: '% → Fraction', gen: genPctToFrac, group: 'Convert' },
  'convert.dec_to_pct': { label: 'Decimal → %', gen: genDecToPct, group: 'Convert' },
  'convert.pct_to_dec': { label: '% → Decimal', gen: genPctToDec, group: 'Convert' },
  ...WORD_TOPICS,
};

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

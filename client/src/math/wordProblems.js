import { Fraction, gcd } from './fraction.js';

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function checkInteger(answer) {
  return (input) => {
    const s = input.trim();
    if (!/^-?\d+$/.test(s)) return false;
    return parseInt(s, 10) === answer;
  };
}

function checkDecimal(answer, tol = 1e-3) {
  return (input) => {
    const s = input.trim();
    const clean = s.endsWith('%') ? s.slice(0, -1) : s;
    if (!/^-?\d+(\.\d+)?$|^-?\.\d+$/.test(clean)) return false;
    const v = parseFloat(clean);
    if (Number.isNaN(v)) return false;
    return Math.abs(v - answer) <= tol;
  };
}

function checkPercent(answer, tol = 0.01) {
  return (input) => {
    const s = input.trim();
    const clean = s.endsWith('%') ? s.slice(0, -1) : s;
    if (!/^-?\d+(\.\d+)?$|^-?\.\d+$/.test(clean)) return false;
    const v = parseFloat(clean);
    return Math.abs(v - answer) <= tol;
  };
}

// --- story tokens ---
const T = (value) => ({ type: 'text', value });
const F = (n, d) => ({ type: 'frac', n, d });

function unitFractionWord(d) {
  if (d === 2) return T('half');
  if (d === 3) return T('one-third');
  if (d === 4) return T('a quarter');
  return F(1, d);
}

// ==================================================================
// 1. Find the original amount (unit fraction)
// ==================================================================
function genFindOriginalUnit(difficulty) {
  const denOptions = difficulty === 'easy' ? [2, 3, 4, 5] : [2, 3, 4, 5, 6, 7, 8, 10, 12];
  const d = pick(denOptions);
  const whole = rand(2, 15) * d;
  const v = whole / d;

  const scenarios = [
    {
      story: [T('If'), F(1, d), T(`of a length of rope is ${v} m, how long is the whole rope?`)],
      unit: 'm',
    },
    {
      story: [T('If'), F(1, d), T(`of a bag of flour is ${v} g, how heavy is the whole bag?`)],
      unit: 'g',
    },
    {
      story: [T(`A glass holds`), F(1, d), T(`of a carton of juice. If the glass holds ${v} ml, how many ml are in the full carton?`)],
      unit: 'ml',
    },
    {
      story: [unitFractionWord(d), T(`of the class are going on the trip. If ${v} pupils are going, how many pupils are in the class?`)],
      unit: 'pupils',
    },
    {
      story: [T('If'), F(1, d), T(`of a sum of money is £${v}, what is the total sum?`)],
      unit: '£',
    },
    {
      story: [T('If'), F(1, d), T(`of the total amount is ${v}, what is the total amount?`)],
      unit: '',
    },
  ];
  const sc = pick(scenarios);
  return {
    topic: 'Word: find the whole (unit fraction)',
    story: sc.story,
    hint: `Whole number${sc.unit ? ` (${sc.unit})` : ''}`,
    check: checkInteger(whole),
    solution: whole,
  };
}

// ==================================================================
// 2. Find the original (non-unit fraction)
// ==================================================================
function genFindOriginalNonUnit(difficulty) {
  const dens = difficulty === 'easy' ? [3, 4, 5, 6, 8] : [3, 4, 5, 6, 7, 8, 10, 12, 15];
  const d = pick(dens);
  let n;
  do { n = rand(2, d - 1); } while (gcd(n, d) !== 1);
  const whole = rand(2, 12) * d;
  const v = (whole * n) / d;

  const scenarios = [
    {
      story: [T('If'), F(n, d), T(`of an amount is ${v}, what is the original amount?`)],
      unit: '',
    },
    {
      story: [F(n, d), T(`of a sum of money is £${v}. What is the total sum?`)],
      unit: '£',
    },
    {
      story: [T('If'), F(n, d), T(`of a length is ${v} m, how long is the whole length?`)],
      unit: 'm',
    },
    {
      story: [T('We have travelled'), T(`${v} km and Dad says that we are`), F(n, d), T('of the whole way. What is the total length in km?')],
      unit: 'km',
    },
  ];
  const sc = pick(scenarios);
  return {
    topic: 'Word: find the whole (non-unit)',
    story: sc.story,
    hint: `Whole number${sc.unit ? ` (${sc.unit})` : ''}`,
    check: checkInteger(whole),
    solution: whole,
  };
}

// ==================================================================
// 3. Reverse division
// ==================================================================
function genReverseDivision(difficulty) {
  const d = pick(difficulty === 'easy' ? [3, 4, 5, 6, 8] : [3, 4, 5, 6, 7, 8, 9, 10, 12]);
  const m = rand(2, difficulty === 'easy' ? 12 : 20);
  const n = d * m;
  return {
    topic: 'Word: reverse division',
    story: [T(`When a number is divided by ${d} the answer is ${m}. What was the number?`)],
    hint: 'Whole number',
    check: checkInteger(n),
    solution: n,
  };
}

// ==================================================================
// 4. Reverse chain of operations
// ==================================================================
function genReverseChain(difficulty) {
  for (let tries = 0; tries < 40; tries++) {
    const a = rand(2, 10);
    const b = rand(2, 10);
    if (a === b) continue;
    const op1 = pick(['÷', '×']);
    const op2 = op1 === '÷' ? '×' : '÷';
    const n = rand(2, 30) * (op1 === '÷' ? a : 1);
    const mid = op1 === '÷' ? n / a : n * a;
    if (!Number.isInteger(mid)) continue;
    const result = op2 === '÷' ? mid / b : mid * b;
    if (!Number.isInteger(result) || result < 2 || result > 200) continue;
    const verbs = {
      '÷': `divided by ${a}`,
      '×': `multiplied by ${a}`,
    };
    const verbs2 = {
      '÷': `divided by ${b}`,
      '×': `multiplied by ${b}`,
    };
    return {
      topic: 'Word: reverse chain',
      story: [
        T(`A number is ${verbs[op1]} and the result is ${verbs2[op2]}. The answer is ${result}. What was the number?`),
      ],
      hint: 'Whole number',
      check: checkInteger(n),
      solution: n,
    };
  }
  return genReverseDivision(difficulty);
}

// ==================================================================
// 5. Sharing
// ==================================================================
function genSharing(difficulty) {
  const n = rand(3, difficulty === 'easy' ? 6 : 10);
  const per = rand(2, 25) * (Math.random() < 0.5 ? 1 : 10);
  const total = n * per;
  const askTotal = Math.random() < 0.6;

  const groups = [
    { text: 'friends share sweets equally. Each gets', unit: 'sweets' },
    { text: 'cooks share a bag of flour equally. Each cook has', unit: 'g' },
    { text: 'children split the cost equally. Each pays £', unit: '£', prePound: true },
  ];
  const g = pick(groups);
  if (askTotal) {
    const story = g.prePound
      ? [T(`${n} ${g.text}${per}. What was the total cost in £?`)]
      : [T(`${n} ${g.text} ${per} ${g.unit}. What was the total?`)];
    return {
      topic: 'Word: sharing (total)',
      story,
      hint: `Whole number${g.unit && !g.prePound ? ` (${g.unit})` : g.prePound ? ' (£)' : ''}`,
      check: checkInteger(total),
      solution: total,
    };
  } else {
    const story = g.prePound
      ? [T(`${n} friends split £${total} equally. How much does each pay?`)]
      : [T(`${n} ${g.text.replace('Each gets', '').replace('Each cook has', '').replace('Each pays £', '')} ${total} ${g.unit === '£' ? '£' : g.unit} equally. How much does each get?`)];
    // simpler second variant
    return {
      topic: 'Word: sharing (each)',
      story: [T(`${n} people share ${total}${g.unit === '£' ? ' pounds' : ' ' + g.unit} equally. How much does each person get?`)],
      hint: `Whole number`,
      check: checkInteger(per),
      solution: per,
    };
  }
}

// ==================================================================
// 6. Fraction of a quantity (with unit conversion)
// ==================================================================
function genFractionOfQuantity(difficulty) {
  const variant = pick(['kg_to_g', 'km_to_m', 'l_to_ml', 'plain', 'plain']);
  if (variant === 'kg_to_g') {
    const d = pick([2, 4, 5, 8, 10]);
    const kg = rand(2, 9);
    const totalG = kg * 1000;
    let n;
    do { n = rand(1, d - 1); } while (gcd(n, d) !== 1 || ((totalG * n) % d) !== 0);
    const ans = (totalG * n) / d;
    return {
      topic: 'Word: fraction of quantity',
      story: [T('What is'), F(n, d), T(`of ${kg} kg, in grams?`)],
      hint: 'Whole number (g)',
      check: checkInteger(ans),
      solution: ans,
    };
  }
  if (variant === 'km_to_m') {
    const d = pick([2, 4, 5, 8, 10]);
    const km = rand(2, 6);
    const totalM = km * 1000;
    let n;
    do { n = rand(1, d - 1); } while (gcd(n, d) !== 1 || ((totalM * n) % d) !== 0);
    const ans = (totalM * n) / d;
    return {
      topic: 'Word: fraction of quantity',
      story: [T('What is'), F(n, d), T(`of ${km} km, in metres?`)],
      hint: 'Whole number (m)',
      check: checkInteger(ans),
      solution: ans,
    };
  }
  if (variant === 'l_to_ml') {
    const d = pick([2, 4, 5, 8, 10]);
    const L = rand(2, 6);
    const totalMl = L * 1000;
    let n;
    do { n = rand(1, d - 1); } while (gcd(n, d) !== 1 || ((totalMl * n) % d) !== 0);
    const ans = (totalMl * n) / d;
    return {
      topic: 'Word: fraction of quantity',
      story: [T('What is'), F(n, d), T(`of ${L} litres, in millilitres?`)],
      hint: 'Whole number (ml)',
      check: checkInteger(ans),
      solution: ans,
    };
  }
  // plain
  const d = pick([3, 4, 5, 6, 7, 8, 10, 12]);
  const mult = rand(2, 10);
  const whole = d * mult;
  const n = rand(1, d - 1);
  const ans = (whole * n) / d;
  return {
    topic: 'Word: fraction of quantity',
    story: [T('Calculate'), F(n, d), T(`of ${whole}.`)],
    hint: 'Whole number',
    check: checkInteger(ans),
    solution: ans,
  };
}

// ==================================================================
// 7. Remaining fraction
// ==================================================================
function genRemainingFraction(difficulty) {
  const d = pick(difficulty === 'easy' ? [3, 4, 5, 6, 8] : [3, 4, 5, 6, 7, 8, 10, 12]);
  let n;
  do { n = rand(1, d - 1); } while (gcd(n, d) !== 1);
  const remainingNum = d - n;
  const totalMult = rand(2, 12);
  const whole = d * totalMult;
  const left = (whole * remainingNum) / d;

  const scenarios = [
    [
      T('I have eaten'), F(n, d), T(`of a bar of chocolate and only have ${left} g left. How many grams were in the whole bar?`),
    ],
    [
      F(n, d), T(`of the class are away today and there are only ${left} of us here. How many are in the class when everyone is in?`),
    ],
    [
      T('We planted bean plants. After two weeks'), F(n, d), T(`of them had died and we only had ${left} left. How many did we plant originally?`),
    ],
  ];
  return {
    topic: 'Word: remaining fraction',
    story: pick(scenarios),
    hint: 'Whole number',
    check: checkInteger(whole),
    solution: whole,
  };
}

// ==================================================================
// 8. Percent of a group (X of Y → %)
// ==================================================================
function genPercentOfGroup(difficulty) {
  const whole = pick([20, 25, 40, 50, 80, 100, 150, 200]);
  const pct = pick([5, 10, 15, 20, 25, 30, 40, 50, 55, 60, 65, 70, 75, 80, 85, 90]);
  const part = (whole * pct) / 100;
  if (!Number.isInteger(part)) return genPercentOfGroup(difficulty);

  const scenarios = [
    {
      ask: 'boys',
      story: T(`In a school of ${whole} pupils, ${part} are boys. What percentage of the school are boys?`),
      answer: pct,
    },
    {
      ask: 'girls',
      story: T(`In a school of ${whole} pupils, ${part} are boys. What percentage of the school are girls?`),
      answer: 100 - pct,
    },
    {
      ask: 'had breakfast',
      story: T(`${whole} children were asked about breakfast. ${part} had cereal. What percentage had cereal?`),
      answer: pct,
    },
    {
      ask: 'test',
      story: T(`You scored ${part} out of ${whole} on a test. Write your result as a percentage.`),
      answer: pct,
    },
    {
      ask: 'blue',
      story: T(`A square is divided into ${whole} equal parts and ${part} are shaded blue. What percentage is blue?`),
      answer: pct,
    },
  ];
  const sc = pick(scenarios);
  return {
    topic: 'Word: percentage of group',
    story: [sc.story],
    hint: 'Percent (with or without %)',
    check: checkPercent(sc.answer),
    solution: `${sc.answer}%`,
  };
}

// ==================================================================
// 9. Percent comparison (difference in pp)
// ==================================================================
function genPercentCompare(difficulty) {
  const wholes = [20, 25, 40, 50, 100];
  const wA = pick(wholes);
  const wB = pick(wholes);
  const pctA = pick([20, 25, 40, 50, 55, 60, 65, 70, 75, 80]);
  let pctB = pick([20, 25, 40, 50, 55, 60, 65, 70, 75, 80]);
  if (pctA === pctB) pctB = pctA === 50 ? 60 : 50;
  const partA = (wA * pctA) / 100;
  const partB = (wB * pctB) / 100;
  if (!Number.isInteger(partA) || !Number.isInteger(partB)) return genPercentCompare(difficulty);
  const diff = Math.abs(pctA - pctB);

  return {
    topic: 'Word: compare percentages',
    story: [
      T(`Class A has ${partA} girls out of ${wA}. Class B has ${partB} girls out of ${wB}. By how many percentage points does the higher class lead? (Answer as a number.)`),
    ],
    hint: 'Number of percentage points',
    check: checkPercent(diff),
    solution: `${diff}`,
  };
}

// ==================================================================
// 10. Percent of a number (in context)
// ==================================================================
function genPercentOfNumberWord(difficulty) {
  const whole = rand(2, 10) * pick([10, 20, 25, 50, 100]);
  const pct = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90]);
  const ans = (whole * pct) / 100;
  if (!Number.isInteger(ans)) return genPercentOfNumberWord(difficulty);

  const scenarios = [
    T(`A jacket costs £${whole}. There is a ${pct}% discount. How much is taken off, in £?`),
    T(`There are ${whole} pupils in the school. ${pct}% play football. How many play football?`),
    T(`A tank holds ${whole} litres of water. ${pct}% leaks out. How many litres leak?`),
    T(`A class has ${whole} pupils. ${pct}% are girls. How many girls are there?`),
  ];
  return {
    topic: 'Word: percent of a number',
    story: [pick(scenarios)],
    hint: 'Whole number',
    check: checkInteger(ans),
    solution: ans,
  };
}

export const WORD_TOPICS = {
  'word.find_original_unit': {
    label: 'Word: find the whole (unit)',
    gen: genFindOriginalUnit,
    group: 'Word problems',
  },
  'word.find_original_nonunit': {
    label: 'Word: find the whole (non-unit)',
    gen: genFindOriginalNonUnit,
    group: 'Word problems',
  },
  'word.reverse_division': {
    label: 'Word: reverse division',
    gen: genReverseDivision,
    group: 'Word problems',
  },
  'word.reverse_chain': {
    label: 'Word: chain of operations',
    gen: genReverseChain,
    group: 'Word problems',
  },
  'word.sharing': {
    label: 'Word: sharing equally',
    gen: genSharing,
    group: 'Word problems',
  },
  'word.fraction_of': {
    label: 'Word: fraction of a quantity',
    gen: genFractionOfQuantity,
    group: 'Word problems',
  },
  'word.remaining': {
    label: 'Word: remaining amount',
    gen: genRemainingFraction,
    group: 'Word problems',
  },
  'word.percent_of_group': {
    label: 'Word: percent of group',
    gen: genPercentOfGroup,
    group: 'Word problems',
  },
  'word.percent_compare': {
    label: 'Word: compare percentages',
    gen: genPercentCompare,
    group: 'Word problems',
  },
  'word.percent_of_number': {
    label: 'Word: percent of a number',
    gen: genPercentOfNumberWord,
    group: 'Word problems',
  },
};

import { gcd } from './fraction.js';

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ---- Checkers ----
// Accept answers with optional currency prefix and/or common unit suffix:
// "£45", "45", "900 g", "1.6 L", "8 km", "25%", "6 m", "300 ml"
function normalizeNumeric(input) {
  let s = String(input).trim();
  s = s.replace(/^[£$€]\s*/, '');
  s = s.replace(/\s*(kilograms?|kg|km|cm|mm|ml|mg|metres|meters|m|L|l|litres|liters|pupils?|pp|pts?|grams?|g|%|£)\s*$/i, '');
  return s.trim();
}

function checkInteger(answer) {
  return (input) => {
    const s = normalizeNumeric(input);
    if (!/^-?\d+$/.test(s)) return false;
    return parseInt(s, 10) === answer;
  };
}

function checkDecimal(answer, tol = 1e-3) {
  return (input) => {
    const s = normalizeNumeric(input);
    if (!/^-?\d+(\.\d+)?$|^-?\.\d+$/.test(s)) return false;
    const v = parseFloat(s);
    if (Number.isNaN(v)) return false;
    return Math.abs(v - answer) <= tol;
  };
}

function checkPercent(answer, tol = 0.01) {
  return (input) => {
    const s = normalizeNumeric(input);
    if (!/^-?\d+(\.\d+)?$|^-?\.\d+$/.test(s)) return false;
    const v = parseFloat(s);
    return Math.abs(v - answer) <= tol;
  };
}

function checkChoice(accepted) {
  const lower = accepted.map((a) => a.toLowerCase().trim());
  return (input) => lower.includes(input.trim().toLowerCase());
}

// ---- Story tokens ----
const T = (value) => ({ type: 'text', value });
const F = (n, d) => ({ type: 'frac', n, d });

function unitWord(d) {
  if (d === 2) return 'half';
  if (d === 3) return 'one-third';
  if (d === 4) return 'a quarter';
  return null;
}

// ==================================================================
// 1. Find the whole from a unit fraction (integer answer)
// ==================================================================
function genFindWholeUnit(difficulty) {
  const dens = difficulty === 'easy' ? [2, 3, 4, 5, 6] : [3, 4, 5, 6, 7, 8, 9, 10, 12];
  const d = pick(dens);
  const whole = rand(2, 15) * d;
  const v = whole / d;

  const scenarios = [
    [T('If'), F(1, d), T(`of the total amount is ${v}, what is the total amount?`)],
    [T('If'), F(1, d), T(`of a length of rope is ${v} m, how long is the whole rope in m?`)],
    [T('If'), F(1, d), T(`of a sum of money is £${v}, what is the total sum in £?`)],
    [T('If'), F(1, d), T(`of a length of wood is ${v} cm, how long is the whole piece in cm?`)],
    (() => {
      const w = unitWord(d);
      return w
        ? [T(`${capitalize(w)} of my class is going on the ski trip. If ${v} pupils are going, how many pupils are in the class?`)]
        : [F(1, d), T(`of my class is going on the ski trip. If ${v} pupils are going, how many are in the class?`)];
    })(),
    [T('We each receive'), F(1, d), T(`of the sweets in a jar. If I get ${v} sweets, how many were in the jar?`)],
  ];
  return {
    topic: 'Find the whole (unit fraction)',
    story: pick(scenarios),
    hint: 'Whole number',
    check: checkInteger(whole),
    solution: whole,
  };
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ==================================================================
// 2. Find the whole from a non-unit fraction (integer answer)
// ==================================================================
function genFindWholeNonUnit(difficulty) {
  const dens = difficulty === 'easy' ? [3, 4, 5, 6, 8] : [3, 4, 5, 6, 7, 8, 10, 12, 15];
  const d = pick(dens);
  let n;
  do { n = rand(2, d - 1); } while (gcd(n, d) !== 1);
  const whole = rand(2, 12) * d;
  const v = (whole * n) / d;

  const scenarios = [
    [T('If'), F(n, d), T(`of a number is ${v}, what is the original number?`)],
    [T('If'), F(n, d), T(`of an amount is ${v}, what is the original amount?`)],
    [F(n, d), T(`of a sum of money is £${v}. What is the total sum in £?`)],
    [T('We have travelled'), T(`${v} km and Dad says that we are`), F(n, d), T('of the whole way. What is the total length in km?')],
  ];
  return {
    topic: 'Find the whole (non-unit)',
    story: pick(scenarios),
    hint: 'Whole number',
    check: checkInteger(whole),
    solution: whole,
  };
}

// ==================================================================
// 3. Find the whole with a decimal answer
// ==================================================================
function genFindWholeDecimal(difficulty) {
  for (let tries = 0; tries < 60; tries++) {
    const d = pick([4, 5, 8, 10]);
    const n = pick([3, 5, 7].filter((x) => x < d && gcd(x, d) === 1));
    if (!n) continue;
    const wholeTenths = rand(10, 80) * d; // multiple of d so v*10 is integer
    const whole = wholeTenths / 10;
    const v = (whole * n) / d;
    if (!Number.isFinite(whole) || !Number.isFinite(v)) continue;
    if (Math.abs(v * 10 - Math.round(v * 10)) > 1e-9) continue;
    const vRounded = Math.round(v * 10) / 10;
    const wholeRounded = Math.round(whole * 10) / 10;
    if (wholeRounded === Math.round(wholeRounded)) continue; // prefer a decimal result

    const scenarios = [
      [T('If'), F(n, d), T(`of a length is ${vRounded} m, how long is the whole length in m?`)],
      [T('If'), F(n, d), T(`of a bag of cement weighs ${vRounded} kg, how heavy is a full bag in kg?`)],
      [F(n, d), T(`of a sum of money is £${vRounded}. What is the total sum in £?`)],
    ];
    return {
      topic: 'Find the whole (decimal answer)',
      story: pick(scenarios),
      hint: 'Decimal number (e.g. 3.2)',
      check: checkDecimal(wholeRounded, 1e-2),
      solution: wholeRounded,
    };
  }
  return genFindWholeNonUnit(difficulty);
}

// ==================================================================
// 4. Find the whole with a unit conversion (ml→L, cm→m, g→kg)
// ==================================================================
function genFindWholeUnitConvert(difficulty) {
  const variants = ['mlToL', 'cmToM', 'gToKg'];
  const v = pick(variants);
  if (v === 'mlToL') {
    const d = pick([4, 5, 8, 10]);
    const glass = pick([100, 125, 200, 250, 500]);
    const cartonMl = d * glass;
    if (cartonMl % 100 !== 0) return genFindWholeUnitConvert(difficulty);
    const cartonL = cartonMl / 1000;
    return {
      topic: 'Find the whole (unit conversion)',
      story: [
        T('A glass holds exactly'),
        F(1, d),
        T(`of a whole carton of juice. If the amount in the glass is ${glass} ml, how many litres were in the carton?`),
      ],
      hint: 'Decimal number (L)',
      check: checkDecimal(Number(cartonL.toFixed(3)), 1e-3),
      solution: `${cartonL} L`,
    };
  }
  if (v === 'cmToM') {
    const d = pick([5, 8, 10, 20, 25, 50, 100, 200]);
    let n;
    do { n = rand(1, Math.min(d - 1, 9)); } while (gcd(n, d) !== 1);
    const totalCm = d * pick([50, 100, 200, 500]);
    const partCm = (totalCm * n) / d;
    if (!Number.isInteger(partCm) || totalCm % 100 !== 0) return genFindWholeUnitConvert(difficulty);
    const totalM = totalCm / 100;
    return {
      topic: 'Find the whole (unit conversion)',
      story: [
        T('If'),
        F(n, d),
        T(`of a length is ${partCm} cm, how many metres long is the whole length?`),
      ],
      hint: 'Decimal or whole number (m)',
      check: checkDecimal(totalM, 1e-3),
      solution: `${totalM} m`,
    };
  }
  // gToKg
  const d = pick([4, 5, 8, 10]);
  let n;
  do { n = rand(1, d - 1); } while (gcd(n, d) !== 1);
  const totalG = d * pick([250, 500, 1000]);
  const partG = (totalG * n) / d;
  if (!Number.isInteger(partG) || totalG % 100 !== 0) return genFindWholeUnitConvert(difficulty);
  const totalKg = totalG / 1000;
  return {
    topic: 'Find the whole (unit conversion)',
    story: [
      T('If'),
      F(n, d),
      T(`of a bag of flour weighs ${partG} g, how many kilograms are in the whole bag?`),
    ],
    hint: 'Decimal or whole number (kg)',
    check: checkDecimal(totalKg, 1e-3),
    solution: `${totalKg} kg`,
  };
}

// ==================================================================
// 5. Fraction of a quantity
// ==================================================================
function genFractionOfAmount(difficulty) {
  const plain = Math.random() < 0.5;
  if (plain) {
    const d = pick([3, 4, 5, 6, 7, 8, 10, 12]);
    let n;
    do { n = rand(1, d - 1); } while (gcd(n, d) !== 1);
    const whole = d * rand(2, 12);
    const ans = (whole * n) / d;
    return {
      topic: 'Fraction of a quantity',
      story: [T('Calculate'), F(n, d), T(`of ${whole}.`)],
      hint: 'Whole number',
      check: checkInteger(ans),
      solution: ans,
    };
  }
  // with unit conversion
  const unitChoice = pick(['kgToG', 'kmToM', 'LToMl']);
  if (unitChoice === 'kgToG') {
    const d = pick([2, 4, 5, 8, 10]);
    const kg = rand(2, 9);
    const totalG = kg * 1000;
    let n;
    do { n = rand(1, d - 1); } while (gcd(n, d) !== 1 || (totalG * n) % d !== 0);
    const ans = (totalG * n) / d;
    return {
      topic: 'Fraction of a quantity',
      story: [T('What is'), F(n, d), T(`of ${kg} kg, in grams?`)],
      hint: 'Whole number (g)',
      check: checkInteger(ans),
      solution: `${ans} g`,
    };
  }
  if (unitChoice === 'kmToM') {
    const d = pick([2, 4, 5, 8, 10]);
    const km = rand(2, 6);
    const totalM = km * 1000;
    let n;
    do { n = rand(1, d - 1); } while (gcd(n, d) !== 1 || (totalM * n) % d !== 0);
    const ans = (totalM * n) / d;
    return {
      topic: 'Fraction of a quantity',
      story: [T('What is'), F(n, d), T(`of ${km} km, in metres?`)],
      hint: 'Whole number (m)',
      check: checkInteger(ans),
      solution: `${ans} m`,
    };
  }
  const d = pick([2, 4, 5, 8, 10]);
  const L = rand(2, 6);
  const totalMl = L * 1000;
  let n;
  do { n = rand(1, d - 1); } while (gcd(n, d) !== 1 || (totalMl * n) % d !== 0);
  const ans = (totalMl * n) / d;
  return {
    topic: 'Fraction of a quantity',
    story: [T('What is'), F(n, d), T(`of ${L} litres, in millilitres?`)],
    hint: 'Whole number (ml)',
    check: checkInteger(ans),
    solution: `${ans} ml`,
  };
}

// ==================================================================
// 6. Remaining amount (simple)
// ==================================================================
function genRemainingSimple(difficulty) {
  const d = pick(difficulty === 'easy' ? [3, 4, 5, 6, 8] : [3, 4, 5, 6, 7, 8, 10, 12]);
  let n;
  do { n = rand(1, d - 1); } while (gcd(n, d) !== 1);
  const rem = d - n;
  const whole = d * rand(2, 12);
  const left = (whole * rem) / d;

  const scenarios = [
    [T('I have eaten'), F(n, d), T(`of a bar of chocolate and only have ${left} g left. How many grams were in the whole bar?`)],
    [F(n, d), T(`of the class are away today and there are only ${left} of us here. How many are in the class when everyone is here?`)],
    [T('We planted bean plants. After two weeks'), F(n, d), T(`had died and we only had ${left} left. How many did we plant originally?`)],
  ];
  return {
    topic: 'Remaining amount',
    story: pick(scenarios),
    hint: 'Whole number',
    check: checkInteger(whole),
    solution: whole,
  };
}

// ==================================================================
// 7. Split into multiple fractions + remainder
// ==================================================================
function genSplitRemainder(difficulty) {
  for (let tries = 0; tries < 60; tries++) {
    const a = pick([2, 3, 4, 5, 6, 8]);
    const b = pick([2, 3, 4, 5, 6, 8]);
    if (a === b) continue;
    let an = rand(1, a - 1);
    let bn = rand(1, b - 1);
    // Need an/a + bn/b < 1 and resulting remainder clean
    const lcm = (a * b) / gcd(a, b);
    const aScaled = an * (lcm / a);
    const bScaled = bn * (lcm / b);
    const rem = lcm - aScaled - bScaled;
    if (rem <= 0) continue;
    const whole = lcm * rand(2, 12);
    if (whole > 3000) continue;
    const partA = (whole * an) / a;
    const partB = (whole * bn) / b;
    const partC = whole - partA - partB;
    if (!Number.isInteger(partA) || !Number.isInteger(partB) || !Number.isInteger(partC)) continue;
    if (partC < 1) continue;

    const kind = Math.random();
    if (kind < 0.5) {
      return {
        topic: 'Split into fractions + remainder',
        story: [
          T(`A ${whole} g bag of flour is divided so that`),
          F(an, a),
          T('is used for a cake,'),
          F(bn, b),
          T('is used for a pastry pie crust and the rest is used to decorate the pie. How many grams are used to decorate the pie?'),
        ],
        hint: 'Whole number (g)',
        check: checkInteger(partC),
        solution: `${partC} g`,
      };
    } else {
      return {
        topic: 'Split into fractions + remainder',
        story: [
          T(`£${whole} is divided so that my sister receives`),
          F(an, a),
          T(', my brother receives'),
          F(bn, b),
          T(', and I have the rest. How much money do I get in £?'),
        ],
        hint: 'Whole number (£)',
        check: checkInteger(partC),
        solution: `£${partC}`,
      };
    }
  }
  return genRemainingSimple(difficulty);
}

// ==================================================================
// 8. Reverse division
// ==================================================================
function genReverseDivision(difficulty) {
  const d = pick(difficulty === 'easy' ? [3, 4, 5, 6, 8] : [3, 4, 5, 6, 7, 8, 9, 10, 12]);
  const m = rand(2, difficulty === 'easy' ? 12 : 20);
  const n = d * m;
  return {
    topic: 'Reverse division',
    story: [T(`When a number is divided by ${d} the answer is ${m}. What was the number?`)],
    hint: 'Whole number',
    check: checkInteger(n),
    solution: n,
  };
}

// ==================================================================
// 9. Reverse chain of operations
// ==================================================================
function genReverseChain(difficulty) {
  for (let tries = 0; tries < 60; tries++) {
    const a = rand(2, 10);
    const b = rand(2, 10);
    if (a === b) continue;
    const op1 = pick(['÷', '×']);
    const op2 = op1 === '÷' ? '×' : '÷';
    const n = rand(2, 25) * (op1 === '÷' ? a : 1);
    const mid = op1 === '÷' ? n / a : n * a;
    if (!Number.isInteger(mid)) continue;
    const result = op2 === '÷' ? mid / b : mid * b;
    if (!Number.isInteger(result) || result < 2 || result > 200) continue;
    const verbs = { '÷': `divided by ${a}`, '×': `multiplied by ${a}` };
    const verbs2 = { '÷': `divided by ${b}`, '×': `multiplied by ${b}` };
    return {
      topic: 'Chain of operations',
      story: [T(`A number is ${verbs[op1]} and the result is ${verbs2[op2]}. The answer is ${result}. What was the number?`)],
      hint: 'Whole number',
      check: checkInteger(n),
      solution: n,
    };
  }
  return genReverseDivision(difficulty);
}

// ==================================================================
// 10. Sharing — find the total
// ==================================================================
function genSharingTotal(difficulty) {
  const n = rand(3, difficulty === 'easy' ? 6 : 10);
  const money = Math.random() < 0.5;
  if (money) {
    const per = rand(2, 25);
    const total = n * per;
    return {
      topic: 'Sharing: find the total',
      story: [T(`Our uncle shares a sum of money among ${n} of us. If we each receive £${per}, what was the total sum in £?`)],
      hint: 'Whole number (£)',
      check: checkInteger(total),
      solution: `£${total}`,
    };
  }
  const per = rand(100, 400);
  const total = n * per;
  return {
    topic: 'Sharing: find the total',
    story: [T(`${n} cooks share a bag of flour equally. If each cook has ${per} g of flour, how much was in the whole bag in g?`)],
    hint: 'Whole number (g)',
    check: checkInteger(total),
    solution: `${total} g`,
  };
}

// ==================================================================
// 11. Sharing — find each
// ==================================================================
function genSharingEach(difficulty) {
  const n = rand(3, difficulty === 'easy' ? 6 : 10);
  const per = rand(2, 25);
  const total = n * per;
  const ctx = pick(['class_groups', 'money']);
  if (ctx === 'class_groups') {
    return {
      topic: 'Sharing: find each',
      story: [T(`A class of ${total} pupils is divided into ${n} equal groups. How many pupils are in each group?`)],
      hint: 'Whole number',
      check: checkInteger(per),
      solution: per,
    };
  }
  return {
    topic: 'Sharing: find each',
    story: [T(`£${total} is shared equally among ${n} friends. How much does each person get in £?`)],
    hint: 'Whole number (£)',
    check: checkInteger(per),
    solution: `£${per}`,
  };
}

// ==================================================================
// 12. Journey problem (Mum says we are half way / 3/5 of the way)
// ==================================================================
function genJourneyTotal(difficulty) {
  if (Math.random() < 0.4) {
    const half = rand(30, 200);
    return {
      topic: 'Journey: find the total',
      story: [T(`We have travelled ${half} km, and Mum says that we are half way. What is the total length of our journey in km?`)],
      hint: 'Whole number (km)',
      check: checkInteger(half * 2),
      solution: `${half * 2} km`,
    };
  }
  const d = pick([3, 4, 5, 6, 8]);
  let n;
  do { n = rand(2, d - 1); } while (gcd(n, d) !== 1);
  const total = d * rand(10, 30);
  const travelled = (total * n) / d;
  return {
    topic: 'Journey: find the total',
    story: [T(`We have travelled ${travelled} km and Dad says that we are`), F(n, d), T('of the whole way. What is the total length of our journey in km?')],
    hint: 'Whole number (km)',
    check: checkInteger(total),
    solution: `${total} km`,
  };
}

// ==================================================================
// 13. Express a part as a percentage
// ==================================================================
function genPercentExpress(difficulty) {
  const setups = [
    { whole: 25, parts: [1, 3, 5, 7, 13, 17, 20, 23] },
    { whole: 20, parts: [1, 3, 5, 7, 11, 13, 16, 19] },
    { whole: 50, parts: [3, 7, 13, 19, 27, 36, 41, 48] },
    { whole: 40, parts: [2, 6, 14, 18, 22, 28, 32, 36] },
    { whole: 75, parts: [3, 15, 30, 45, 60, 63] },
    { whole: 100, parts: [3, 17, 29, 41, 52, 68, 84, 91] },
    { whole: 200, parts: [10, 30, 50, 70, 90, 120, 160, 180] },
  ];
  const s = pick(setups);
  const part = pick(s.parts);
  const pct = (part / s.whole) * 100;
  if (Math.abs(pct - Math.round(pct * 100) / 100) > 1e-9) return genPercentExpress(difficulty);

  const scenarios = [
    T(`In a school of ${s.whole} pupils, ${part} are boys. What percentage of the school are boys?`),
    T(`In a school of ${s.whole} pupils, ${part} are boys. What percentage of the school are girls?`),
    T(`A square is divided into ${s.whole} equal parts and ${part} parts are shaded blue. What percentage is shaded blue?`),
    T(`A square is divided into ${s.whole} equal parts and ${part} are shaded blue. What percentage is not coloured?`),
    T(`You scored ${part} out of ${s.whole} on a test. Write your result as a percentage.`),
  ];
  const idx = rand(0, scenarios.length - 1);
  const isComplement = idx === 1 || idx === 3;
  const answer = isComplement ? Math.round((100 - pct) * 100) / 100 : Math.round(pct * 100) / 100;
  return {
    topic: 'Express as percentage',
    story: [scenarios[idx]],
    hint: 'Percent (e.g. 25 or 25%)',
    check: checkPercent(answer),
    solution: `${answer}%`,
  };
}

// ==================================================================
// 14. Percent of a number (in context, integer answer)
// ==================================================================
function genPercentOfNumber(difficulty) {
  for (let tries = 0; tries < 30; tries++) {
    const whole = rand(2, 10) * pick([10, 20, 25, 50, 100]);
    const pct = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90]);
    const ans = (whole * pct) / 100;
    if (!Number.isInteger(ans)) continue;

    const scenarios = [
      T(`A jacket costs £${whole}. There is a ${pct}% discount. How much money is taken off in £?`),
      T(`There are ${whole} pupils in the school. ${pct}% play football. How many pupils play football?`),
      T(`A tank holds ${whole} litres of water. ${pct}% leaks out. How many litres leak out?`),
      T(`A class has ${whole} pupils. ${pct}% are girls. How many girls are in the class?`),
      T(`A shop has ${whole} books. ${pct}% are sold in one day. How many books are sold?`),
    ];
    return {
      topic: 'Percent of a number',
      story: [pick(scenarios)],
      hint: 'Whole number',
      check: checkInteger(ans),
      solution: ans,
    };
  }
  return genPercentExpress(difficulty);
}

// ==================================================================
// 15. Compare percentages — which class / square has the higher %?
// ==================================================================
function genPercentCompareWhich(difficulty) {
  for (let tries = 0; tries < 40; tries++) {
    const [wA, wB] = shuffle([20, 25, 40, 50, 75, 100]).slice(0, 2);
    const pctA = pick([20, 25, 40, 50, 55, 60, 65, 70, 75, 80]);
    const pctB = pick([20, 25, 40, 50, 55, 60, 65, 70, 75, 80]);
    if (pctA === pctB) continue;
    const partA = (wA * pctA) / 100;
    const partB = (wB * pctB) / 100;
    if (!Number.isInteger(partA) || !Number.isInteger(partB)) continue;
    const higher = pctA > pctB ? 'A' : 'B';
    return {
      topic: 'Compare percentages',
      story: [
        T(`In class A, ${partA} out of ${wA} pupils are girls. In class B, ${partB} out of ${wB} pupils are girls. Which class has a higher percentage of girls? (Type A or B.)`),
      ],
      hint: 'Type A or B',
      check: checkChoice([higher, `class ${higher}`, `${higher}.`]),
      solution: higher,
    };
  }
  return genPercentExpress(difficulty);
}

// ==================================================================
// 16. Compare percentages — by how many percentage points?
// ==================================================================
function genPercentCompareDiff(difficulty) {
  for (let tries = 0; tries < 40; tries++) {
    const [wA, wB] = shuffle([20, 25, 40, 50, 75, 100]).slice(0, 2);
    const pctA = pick([20, 25, 40, 50, 55, 60, 65, 70, 75, 80]);
    const pctB = pick([20, 25, 40, 50, 55, 60, 65, 70, 75, 80]);
    if (pctA === pctB) continue;
    const partA = (wA * pctA) / 100;
    const partB = (wB * pctB) / 100;
    if (!Number.isInteger(partA) || !Number.isInteger(partB)) continue;
    const diff = Math.abs(pctA - pctB);
    return {
      topic: 'Compare percentages (difference)',
      story: [
        T(`Class A has ${partA} girls out of ${wA}. Class B has ${partB} girls out of ${wB}. By how many percentage points does the higher class lead?`),
      ],
      hint: 'Percent difference (e.g. 5 or 5%)',
      check: checkPercent(diff),
      solution: `${diff}%`,
    };
  }
  return genPercentCompareWhich(difficulty);
}

// ==================================================================
// 17. Best of a list — which test score is the highest percentage?
// ==================================================================
const SUBJECTS = ['English', 'Maths', 'History', 'Spelling', 'Science', 'Art', 'Geography', 'French'];
const SCORE_OPTIONS = [
  { denom: 20, pcts: [55, 60, 65, 70, 75, 80, 85, 90, 95] },
  { denom: 25, pcts: [52, 60, 64, 68, 72, 76, 80, 84, 88, 92] },
  { denom: 40, pcts: [55, 60, 65, 70, 75, 80, 85, 90] },
  { denom: 50, pcts: [56, 60, 64, 68, 72, 76, 80, 84, 88, 92] },
  { denom: 75, pcts: [60, 68, 72, 76, 80, 84, 88] },
  { denom: 100, pcts: [55, 60, 65, 70, 75, 80, 85, 90] },
];

function genBestOfList(difficulty) {
  for (let tries = 0; tries < 40; tries++) {
    const subjects = shuffle(SUBJECTS).slice(0, 4);
    const usedPcts = new Set();
    const entries = subjects.map(() => {
      const setup = pick(SCORE_OPTIONS);
      for (let k = 0; k < 20; k++) {
        const pct = pick(setup.pcts);
        if (usedPcts.has(pct)) continue;
        const score = (setup.denom * pct) / 100;
        if (!Number.isInteger(score)) continue;
        usedPcts.add(pct);
        return { subject: null, score, denom: setup.denom, pct };
      }
      return null;
    });
    if (entries.some((e) => e === null)) continue;
    entries.forEach((e, i) => (e.subject = subjects[i]));
    const best = entries.reduce((a, b) => (a.pct > b.pct ? a : b));
    const listStr = entries.map((e) => `${e.subject} ${e.score} out of ${e.denom}`).join(', ');
    return {
      topic: 'Best of a list (by percentage)',
      story: [T(`These are my recent test results: ${listStr}. Which subject was my best? (Type the name.)`)],
      hint: 'Subject name',
      check: checkChoice([best.subject]),
      solution: best.subject,
    };
  }
  return genPercentExpress(difficulty);
}

// ==================================================================
// Topic registry
// ==================================================================
export const WORD_TOPICS = {
  'word.find_whole_unit': {
    label: 'Find the whole (unit fraction)',
    gen: genFindWholeUnit,
    group: 'Finding the whole',
  },
  'word.find_whole_nonunit': {
    label: 'Find the whole (non-unit)',
    gen: genFindWholeNonUnit,
    group: 'Finding the whole',
  },
  'word.find_whole_decimal': {
    label: 'Find the whole (decimal answer)',
    gen: genFindWholeDecimal,
    group: 'Finding the whole',
  },
  'word.find_whole_unit_convert': {
    label: 'Find the whole (unit conversion)',
    gen: genFindWholeUnitConvert,
    group: 'Finding the whole',
  },
  'word.fraction_of_amount': {
    label: 'Fraction of an amount',
    gen: genFractionOfAmount,
    group: 'Fractions',
  },
  'word.remaining_simple': {
    label: 'Remaining amount',
    gen: genRemainingSimple,
    group: 'Fractions',
  },
  'word.split_remainder': {
    label: 'Split into parts + remainder',
    gen: genSplitRemainder,
    group: 'Fractions',
  },
  'word.reverse_division': {
    label: 'Reverse division',
    gen: genReverseDivision,
    group: 'Reverse operations',
  },
  'word.reverse_chain': {
    label: 'Chain of operations',
    gen: genReverseChain,
    group: 'Reverse operations',
  },
  'word.sharing_total': {
    label: 'Sharing: find the total',
    gen: genSharingTotal,
    group: 'Sharing',
  },
  'word.sharing_each': {
    label: 'Sharing: find each',
    gen: genSharingEach,
    group: 'Sharing',
  },
  'word.journey_total': {
    label: 'Journey problems',
    gen: genJourneyTotal,
    group: 'Sharing',
  },
  'word.percent_express': {
    label: 'Express as a percentage',
    gen: genPercentExpress,
    group: 'Percentages',
  },
  'word.percent_of_number': {
    label: 'Percent of a number',
    gen: genPercentOfNumber,
    group: 'Percentages',
  },
  'word.percent_compare_which': {
    label: 'Compare: which is higher?',
    gen: genPercentCompareWhich,
    group: 'Percentages',
  },
  'word.percent_compare_diff': {
    label: 'Compare: by how much?',
    gen: genPercentCompareDiff,
    group: 'Percentages',
  },
  'word.best_of_list': {
    label: 'Best test score',
    gen: genBestOfList,
    group: 'Percentages',
  },
};

export function gcd(a, b) {
  a = Math.abs(a | 0);
  b = Math.abs(b | 0);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

export function lcm(a, b) {
  return Math.abs((a * b) / gcd(a, b));
}

export class Fraction {
  constructor(n, d = 1) {
    if (d === 0) throw new Error('Division by zero');
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d);
    this.n = n / g;
    this.d = d / g;
  }

  static from(value) {
    if (value instanceof Fraction) return value;
    if (typeof value === 'number' && Number.isInteger(value)) return new Fraction(value, 1);
    throw new Error('Cannot convert ' + value + ' to Fraction');
  }

  add(o) { o = Fraction.from(o); return new Fraction(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { o = Fraction.from(o); return new Fraction(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { o = Fraction.from(o); return new Fraction(this.n * o.n, this.d * o.d); }
  div(o) { o = Fraction.from(o); return new Fraction(this.n * o.d, this.d * o.n); }
  neg() { return new Fraction(-this.n, this.d); }

  equals(o) { o = Fraction.from(o); return this.n === o.n && this.d === o.d; }
  toDecimal() { return this.n / this.d; }
  isWhole() { return this.d === 1; }
  isProper() { return Math.abs(this.n) < this.d; }

  toString() {
    if (this.d === 1) return `${this.n}`;
    return `${this.n}/${this.d}`;
  }

  toMixedParts() {
    const sign = this.n < 0 ? -1 : 1;
    const absN = Math.abs(this.n);
    const whole = Math.floor(absN / this.d) * sign;
    const rem = absN % this.d;
    return { whole, n: rem, d: this.d };
  }
}

const TERMINATING_DENOMS = new Set();
(function init() {
  for (let a = 0; a <= 10; a++) {
    for (let b = 0; b <= 6; b++) {
      const v = Math.pow(2, a) * Math.pow(5, b);
      if (v <= 10000) TERMINATING_DENOMS.add(v);
    }
  }
})();

export function fractionToExactDecimal(frac) {
  if (!TERMINATING_DENOMS.has(frac.d)) return null;
  const val = frac.n / frac.d;
  return Number(val.toFixed(6)).toString();
}

export function decimalToFraction(dec) {
  const str = String(dec);
  const neg = str.startsWith('-');
  const clean = neg ? str.slice(1) : str;
  const [whole, frac = ''] = clean.split('.');
  const denom = Math.pow(10, frac.length);
  const numer = parseInt(whole || '0', 10) * denom + parseInt(frac || '0', 10);
  return new Fraction(neg ? -numer : numer, denom);
}

export function parseUserFraction(input) {
  const s = input.trim().replace(/\s+/g, ' ');
  if (s === '') return null;
  const pctMatch = s.match(/^-?\d+(\.\d+)?%$/);
  if (pctMatch) {
    const v = parseFloat(s.slice(0, -1)) / 100;
    return decimalToFraction(v);
  }
  const mixedMatch = s.match(/^(-?)(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const sign = mixedMatch[1] === '-' ? -1 : 1;
    const whole = parseInt(mixedMatch[2], 10);
    const n = parseInt(mixedMatch[3], 10);
    const d = parseInt(mixedMatch[4], 10);
    if (d === 0) return null;
    return new Fraction(sign * (whole * d + n), d);
  }
  const fracMatch = s.match(/^(-?\d+)\/(-?\d+)$/);
  if (fracMatch) {
    const n = parseInt(fracMatch[1], 10);
    const d = parseInt(fracMatch[2], 10);
    if (d === 0) return null;
    return new Fraction(n, d);
  }
  const decMatch = s.match(/^-?\d+(\.\d+)?$|^-?\.\d+$/);
  if (decMatch) {
    return decimalToFraction(s);
  }
  return null;
}

export function parseUserNumber(input) {
  const s = input.trim();
  if (s === '') return null;
  const pct = s.endsWith('%');
  const clean = pct ? s.slice(0, -1).trim() : s;
  if (!/^-?\d+(\.\d+)?$|^-?\.\d+$/.test(clean)) return null;
  const v = parseFloat(clean);
  if (Number.isNaN(v)) return null;
  return pct ? v / 100 : v;
}

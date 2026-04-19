# Math Sprint

A daily 15-minute **word-problem** practice game for an 11-year-old. All
questions are short word problems modeled on the textbook exercises
covering fractions, decimals, and percentages. Every question is
generated dynamically so nothing can be memorized. Typing-fluent feel:
answer, press Enter, next question.

Built with React + Vite on the client and a tiny Node/Express server. One
service, deployable to Render in about two minutes.

## What's in the question pool

Seventeen generators grouped into five sections:

**Finding the whole** — unit-fraction and non-unit-fraction "reverse"
problems, decimal-answer versions (e.g. `5/8 of a length is 2 m → 3.2 m`),
and ones requiring unit conversion (`1/8 of a carton is 200 ml → 1.6 L`).

**Fractions** — fraction of an amount (including `kg→g`, `km→m`, `L→ml`),
remaining-amount problems (chocolate eaten, classmates absent, bean plants
that died), and split-with-remainder problems (`2 kg flour: 3/8 cake,
3/5 crust, rest decorating`).

**Reverse operations** — "when a number is divided by 12 the answer is 3" and
two-step chains like "divided by 6 then multiplied by 5".

**Sharing** — find the total or find each share; journey problems
("travelled 105 km, half way — full length?").

**Percentages** — express as a percentage, percent of a number in context
(discounts, tanks, classes), which class has the higher percentage, by how
many percentage points, and "best subject" given a list of test scores.

All answers are clean integers or one-decimal numbers so mental math works.
Currency prefixes and unit suffixes on the input are accepted
(`£45`, `45`, `300 ml`, `1.6 L`, `25%`).

Pick Easy / Medium / Hard; pick any subset of topics. Streak counter
persists in localStorage so tomorrow's session picks up where today's left
off.

## Input formats

- Whole number: `45`
- Decimal: `3.2`
- Percent: `25` or `25%`
- Choice questions: `A` / `B` or the subject name
- Optional currency/unit: `£45`, `300 ml`, `1.6 L`, `8 km` are all fine

## Run locally

```bash
npm install
npm run build      # builds the React client into client/dist
npm start          # serves at http://localhost:3000
```

During client development:

```bash
npm run dev:server   # API on :3000
npm run dev:client   # Vite on :5173 (proxies /api to :3000)
```

## Deploy to Render

The repo includes a `render.yaml` blueprint. Two ways to deploy:

**Option A — Blueprint (one click):**
1. Push this repo to GitHub.
2. On Render, New → Blueprint → pick the repo.
3. Render reads `render.yaml` and provisions a free web service.

**Option B — Manual web service:**
1. New → Web Service → connect the repo.
2. Environment: `Node`.
3. Build command: `npm install && npm run build`.
4. Start command: `npm start`.
5. Node version: 20.

Render sets `PORT` automatically; the server reads `process.env.PORT`.

## How to use it

Sit down for 15 minutes a day. Start the sprint, answer fast, skip when stuck
(the answer reveals), then come back tomorrow. The post-session summary
highlights the weakest topics so you know what to lean into next.

## Project layout

```
server/           Express server that serves the built client
client/           React + Vite app
  src/math/       Fraction class, parser, question generators
  src/components/ Start / Game / Summary screens
scripts/          Randomized smoke tests for the generators
render.yaml       Render blueprint
```

## Tests

```bash
node scripts/smoke-test.mjs    # 3960 random questions across all topics
node scripts/checker-test.mjs  # checker edge cases (simplification, etc.)
```

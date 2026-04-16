# Math Sprint

A daily 15-minute math practice game for an 11-year-old covering fractions,
decimals, percentages, and all their conversions. Every question is generated
dynamically so nothing can be memorized. Typing-fluent feel: answer, press
Enter, next question.

Built with React + Vite on the client and a tiny Node/Express server. One
service, deployable to Render in about two minutes.

## Topics covered

**Fractions** — add, subtract, multiply, divide, simplify, equivalent
fractions, compare, and "of a quantity" problems. Mixed numbers mixed in at
higher difficulty.

**Decimals** — add, subtract, multiply, divide, scale by 10/100/1000, round to
tenths/hundredths/thousandths, compare.

**Percents** — percent of a number, expressing one quantity as a percent of
another.

**Conversions** — fraction ↔ decimal, fraction ↔ percent, decimal ↔ percent.

Pick Easy / Medium / Hard; pick any subset of topics or use one of the
presets (All, Fractions-only, Conversions-only). Streak counter persists in
localStorage so tomorrow's session picks up where today's left off.

## Input formats

- Fraction: `3/4` or `1 1/2` (mixed numbers use a space)
- Decimal: `0.75`
- Percent: `50` or `50%`
- Compare: `<`, `>`, or `=`

Equivalent fractions are accepted for arithmetic answers (`6/8` counts as
`3/4`), but simplify / decimal-to-fraction questions require fully reduced
form on purpose — that's the skill being drilled.

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

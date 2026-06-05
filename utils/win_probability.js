/**
 * Monte Carlo simulation for IsaacTI character win probabilities.
 *
 * Simulates random test-taking and measures:
 * 1. Each character's probability of being a top match (ties included)
 * 2. Distribution of how many characters tie for top match
 *
 * Usage: node utils/win_probability.js
 */

const fs = require('fs');
const path = require('path');

// Load characters from index.html
const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const m = html.match(/const characters = (\[[\s\S]*?\]);/);
const chars = eval(m[1]);
const charPatterns = chars.map(c => ({
  code: c.code,
  cn: c.cn,
  en: c.en,
  p: c.pattern.replace(/\s/g, '')
}));

const N = chars.length;
const SIMS = 1_000_000;

// Euclidean distance with raw scores (matches index.html algorithm)
const charLevelMap = { L: 2, M: 4, H: 6 };

function distRaw(userPat, charPat) {
  let dist = 0;
  for (let i = 0; i < 15; i++) {
    const u = parseInt(userPat[i]);
    const c = charLevelMap[charPat[i]] || 4;
    const diff = u - c;
    dist += diff * diff;
  }
  return dist;
}

function calcMatch(dist) {
  return Math.max(0, Math.round((1 - dist / 240) * 100));
}

// Seeded PRNG for reproducibility
let seed = 12345;
function rand() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

function randInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

// Generate a random user pattern: 15 dimensions, each with 2 sub-questions scored 1-3
function genUserRaw() {
  const raw = [];
  for (let i = 0; i < 15; i++) {
    raw.push(randInt(1, 3) + randInt(1, 3));
  }
  return raw.join('');
}

// Stats
const winCount = new Array(N).fill(0);       // times each character is among winners
const tieDist = {};                            // tieCount -> frequency
const matchPairCount = {};                     // "codeA|codeB" -> times they tie at top

// For co-occurrence: which characters tend to tie together
const coOccurrence = Array.from({ length: N }, () => new Array(N).fill(0));

console.log(`Running ${SIMS.toLocaleString()} simulations with ${N} characters...\n`);
const startTime = Date.now();

for (let t = 0; t < SIMS; t++) {
  const userPat = genUserRaw();

  // Find best match distance
  let bestDist = Infinity;
  for (let i = 0; i < N; i++) {
    const d = distRaw(userPat, charPatterns[i].p);
    if (d < bestDist) bestDist = d;
  }

  // Collect all winners (ties)
  const winners = [];
  for (let i = 0; i < N; i++) {
    const d = distRaw(userPat, charPatterns[i].p);
    if (d === bestDist) winners.push(i);
  }

  // Record stats
  const tieCount = winners.length;
  tieDist[tieCount] = (tieDist[tieCount] || 0) + 1;

  for (const idx of winners) {
    winCount[idx]++;
  }

  // Co-occurrence matrix (symmetric)
  for (let a = 0; a < tieCount; a++) {
    for (let b = a + 1; b < tieCount; b++) {
      coOccurrence[winners[a]][winners[b]]++;
      coOccurrence[winners[b]][winners[a]]++;
    }
  }
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

// ====== Output ======

console.log(`Completed in ${elapsed}s\n`);

// 1. Per-character win probability
console.log('='.repeat(70));
console.log(`  Character Win Probabilities (${SIMS.toLocaleString()} simulations)`);
console.log('='.repeat(70));
console.log('');

const charStats = chars.map((c, i) => ({
  idx: i,
  code: c.code,
  cn: c.cn,
  en: c.en,
  pattern: c.pattern.replace(/\s/g, ''),
  wins: winCount[i],
  prob: (winCount[i] / SIMS * 100)
})).sort((a, b) => b.prob - a.prob);

console.log('Rank | Code | Character          | Pattern            | Win%   | Wins');
console.log('-'.repeat(78));
charStats.forEach((s, rank) => {
  const rankStr = String(rank + 1).padStart(3);
  const codeStr = s.code.padEnd(4);
  const nameStr = `${s.cn} / ${s.en}`.padEnd(18);
  const patStr = s.pattern.padEnd(16);
  const pctStr = s.prob.toFixed(4).padStart(7);
  console.log(`${rankStr}  | ${codeStr} | ${nameStr} | ${patStr} | ${pctStr}% | ${s.wins.toLocaleString()}`);
});

// 2. Tie distribution
console.log('');
console.log('='.repeat(70));
console.log('  Tie Count Distribution (how many characters share top match)');
console.log('='.repeat(70));
console.log('');

const maxTie = Math.max(...Object.keys(tieDist).map(Number));
console.log('Tie Count | Frequency   | Percentage | Cumulative');
console.log('-'.repeat(55));
let cumulative = 0;
for (let k = 1; k <= maxTie; k++) {
  const freq = tieDist[k] || 0;
  const pct = (freq / SIMS * 100);
  cumulative += pct;
  const bar = '#'.repeat(Math.round(pct / 2));
  console.log(`    ${String(k).padStart(2)}    | ${freq.toLocaleString().padStart(11)} | ${pct.toFixed(2).padStart(8)}%  | ${cumulative.toFixed(2).padStart(8)}%  ${bar}`);
}

// 3. Summary stats
const uniqueWinRate = ((tieDist[1] || 0) / SIMS * 100);
const tieRate = (1 - (tieDist[1] || 0) / SIMS) * 100;
const avgTie = Object.entries(tieDist).reduce((s, [k, v]) => s + Number(k) * v, 0) / SIMS;
console.log('');
console.log(`Unique winner (no tie): ${uniqueWinRate.toFixed(2)}%`);
console.log(`Any tie occurring:      ${tieRate.toFixed(2)}%`);
console.log(`Average winners per test: ${avgTie.toFixed(3)}`);

// 4. Top co-occurrence pairs
console.log('');
console.log('='.repeat(70));
console.log('  Top 20 Most Frequent Tie Pairs');
console.log('='.repeat(70));
console.log('');

const pairs = [];
for (let a = 0; a < N; a++) {
  for (let b = a + 1; b < N; b++) {
    if (coOccurrence[a][b] > 0) {
      pairs.push({
        a: charPatterns[a],
        b: charPatterns[b],
        count: coOccurrence[a][b],
        prob: (coOccurrence[a][b] / SIMS * 100)
      });
    }
  }
}
pairs.sort((a, b) => b.count - a.count);

console.log('Rank | Pair                                    | Co-Tie%  | Count');
console.log('-'.repeat(72));
pairs.slice(0, 20).forEach((p, i) => {
  const pairStr = `${p.a.cn}/${p.a.en} <-> ${p.b.cn}/${p.b.en}`.padEnd(40);
  console.log(` ${String(i + 1).padStart(2)}  | ${pairStr} | ${p.prob.toFixed(4).padStart(7)}% | ${p.count.toLocaleString()}`);
});

// 5. Character pair heatmap (top characters only)
console.log('');
console.log('='.repeat(70));
console.log('  Co-Tie Matrix (top 10 characters, count per 1M sims)');
console.log('='.repeat(70));
console.log('');

const top10 = charStats.slice(0, 10);
const header = '            ' + top10.map(s => s.code.padStart(6)).join('');
console.log(header);
for (const row of top10) {
  let line = `${row.code.padEnd(12)}`;
  for (const col of top10) {
    if (row.idx === col.idx) {
      line += '     -';
    } else {
      const val = coOccurrence[row.idx][col.idx];
      line += val > 0 ? String(val).padStart(6) : '     .';
    }
  }
  console.log(line);
}

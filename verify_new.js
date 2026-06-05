const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/const characters = (\[[\s\S]*?\]);/);
const chars = eval(m[1]);

const charLevelMap = { L: 2, M: 4, H: 6 };
const charPatterns = chars.map(c => ({
  code: c.code, cn: c.cn,
  p: c.pattern.replace(/\s/g, '')
}));

function genUserRaw() {
  const raw = [];
  for (let i = 0; i < 15; i++) {
    raw.push(Math.floor(Math.random() * 3) + 1 + Math.floor(Math.random() * 3) + 1);
  }
  return raw.join('');
}

function distManhattan(u, c) {
  let d = 0;
  for (let i = 0; i < 15; i++) d += Math.abs(parseInt(u[i]) - (charLevelMap[c[i]] || 4));
  return d;
}

function distEuclidean(u, c) {
  let d = 0;
  for (let i = 0; i < 15; i++) {
    const diff = Math.abs(parseInt(u[i]) - (charLevelMap[c[i]] || 4));
    d += diff * diff;
  }
  return d;
}

// Also test: use raw scores with L=2, M=4, H=6 but Euclidean
// And: 5-level character patterns (L=2, M=3, H=4) to cover more of the space
const charLevelMap5 = { L: 2, M: 3, H: 4 };
function distManhattan5(u, c) {
  let d = 0;
  for (let i = 0; i < 15; i++) d += Math.abs(parseInt(u[i]) - (charLevelMap5[c[i]] || 3));
  return d;
}

const N = 500000;
const methods = {
  'A. 曼哈顿+L/M/H (当前)': { ties: 0, maxTie: 0, useRaw: false, distFn: (u, c) => {
    const map = { L: 0, M: 1, H: 2 };
    let d = 0;
    for (let i = 0; i < 15; i++) {
      const lv = u[i] <= 3 ? 'L' : u[i] === 4 ? 'M' : 'H';
      d += Math.abs((map[lv] || 1) - (map[c[i]] || 1));
    }
    return d;
  }, maxDist: 30 },
  'B. 欧氏+L/M/H': { ties: 0, maxTie: 0, useRaw: false, distFn: (u, c) => {
    const map = { L: 0, M: 1, H: 2 };
    let d = 0;
    for (let i = 0; i < 15; i++) {
      const lv = u[i] <= 3 ? 'L' : u[i] === 4 ? 'M' : 'H';
      const diff = Math.abs((map[lv] || 1) - (map[c[i]] || 1));
      d += diff * diff;
    }
    return d;
  }, maxDist: 60 },
  'C. 曼哈顿+原始{2,4,6}': { ties: 0, maxTie: 0, distFn: distManhattan, maxDist: 60 },
  'D. 欧氏+原始{2,4,6}': { ties: 0, maxTie: 0, distFn: distEuclidean, maxDist: 240 },
  'E. 曼哈顿+{2,3,4}映射': { ties: 0, maxTie: 0, distFn: distManhattan5, maxDist: 60 },
};

let seed = 42;
const origRandom = Math.random;
Math.random = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

for (let t = 0; t < N; t++) {
  const userPat = genUserRaw();
  for (const [name, method] of Object.entries(methods)) {
    let best = Infinity, count = 0;
    for (const c of charPatterns) {
      const d = method.distFn(userPat, c.p);
      if (d < best) { best = d; count = 1; }
      else if (d === best) { count++; }
    }
    if (count > 1) method.ties++;
    if (count > method.maxTie) method.maxTie = count;
  }
}

Math.random = origRandom;

console.log(`蒙特卡洛 ${N.toLocaleString()} 次\n`);
console.log('方案 | 平局率 | 最大平局');
console.log('-----|-------|--------');
for (const [name, m] of Object.entries(methods)) {
  console.log(`${name} | ${(m.ties/N*100).toFixed(1)}% | ${m.maxTie}`);
}

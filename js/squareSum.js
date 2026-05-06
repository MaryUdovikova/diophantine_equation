


let squareSumN = null;
let squareSumAllPairs = []; 
let squareSumUserPairs = []; 
let squareSumCanvas = null;
let squareSumCtx = null;
let squareSumTaskFinished = false; 
let squareSumHintRevealed = false; 

const squareSumPairInSolution = (x, y) =>
  squareSumAllPairs.some(([a, b]) => a === x && b === y);


const squareSumSubscriptNumber = (num) => {
  const map = '₀₁₂₃₄₅₆₇₈₉';
  return String(num)
    .split('')
    .map((d) => map[parseInt(d, 10)])
    .join('');
};

const getSquareSumPairRowsContainer = () => qs('#squareSumPairRows');

const getSquareSumPairRows = () => {
  const c = getSquareSumPairRowsContainer();
  return c ? [...c.querySelectorAll('.square-sum-pair-row')] : [];
};

const parseSquareSumIntInput = (input) => {
  if (!input || input.value.trim() === '') return null;
  const n = Number(input.value);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  return n;
};


const syncSquareSumUserPairsFromRows = () => {
  squareSumUserPairs = [];
  if (squareSumN === null) return;
  const seen = new Set();
  for (const row of getSquareSumPairRows()) {
    const ix = row.querySelector('.square-sum-pair-x');
    const iy = row.querySelector('.square-sum-pair-y');
    const vx = parseSquareSumIntInput(ix);
    const vy = parseSquareSumIntInput(iy);
    if (vx === null || vy === null) continue;
    const key = `${vx},${vy}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const onCircle = vx * vx + vy * vy === squareSumN;
    squareSumUserPairs.push({ x: vx, y: vy, onCircle });
  }
};

const onSquareSumPairRowInput = () => {
  syncSquareSumUserPairsFromRows();
  const viz = qs('#squareSumVizWrapper');
  if (viz && viz.style.display === 'block') drawSquareSumPlane();
};

const createSquareSumPairRow = (pairIndex, opts = {}) => {
  const { disabled = false, x = null, y = null } = opts;
  const row = document.createElement('div');
  row.className = 'square-sum-pair-row';
  row.dataset.pairIndex = String(pairIndex);

  const lx = document.createElement('label');
  const sx = document.createElement('span');
  sx.className = 'linear-field-label-prefix';
  const iLabel = pairIndex + 1;
  sx.append(document.createTextNode('x'));
  const subX = document.createElement('span');
  subX.className = 'sub-idx';
  subX.textContent = String(iLabel);
  sx.append(subX, document.createTextNode(' ='));
  const ix = document.createElement('input');
  ix.type = 'number';
  ix.step = '1';
  ix.className = 'square-sum-pair-x';
  ix.setAttribute('aria-label', `Пара ${pairIndex + 1}: координата x (можна від’ємне)`);

  const ly = document.createElement('label');
  const sy = document.createElement('span');
  sy.className = 'linear-field-label-prefix';
  sy.append(document.createTextNode('y'));
  const subY = document.createElement('span');
  subY.className = 'sub-idx';
  subY.textContent = String(iLabel);
  sy.append(subY, document.createTextNode(' ='));
  const iy = document.createElement('input');
  iy.type = 'number';
  iy.step = '1';
  iy.className = 'square-sum-pair-y';
  iy.setAttribute('aria-label', `Пара ${pairIndex + 1}: координата y (можна від’ємне)`);

  if (x !== null && x !== undefined) ix.value = String(x);
  if (y !== null && y !== undefined) iy.value = String(y);
  ix.disabled = disabled;
  iy.disabled = disabled;

  lx.append(sx, ix);
  ly.append(sy, iy);
  row.append(lx, ly);

  if (!disabled) {
    ix.addEventListener('input', onSquareSumPairRowInput);
    iy.addEventListener('input', onSquareSumPairRowInput);
  }

  return row;
};

const resetSquareSumPairRows = (rowCount) => {
  const container = getSquareSumPairRowsContainer();
  if (!container) return;
  container.innerHTML = '';
  const n = Math.max(1, rowCount);
  for (let i = 0; i < n; i += 1) {
    container.appendChild(createSquareSumPairRow(i));
  }
};

const getSquareSumDifficulty = () => {
  const r = document.querySelector('input[name="squareSumDifficulty"]:checked');
  return r ? r.value : 'medium';
};


const generateSquareSumTask = (difficulty) => {
  const level = difficulty || getSquareSumDifficulty();
  let minV;
  let maxV;
  switch (level) {
    case 'easy':
      minV = 1;
      maxV = 5;
      break;
    case 'hard':
      minV = 9;
      maxV = 11;
      break;
    case 'medium':
    default:
      minV = 6;
      maxV = 8;
      break;
  }
  const span = maxV - minV + 1;
  const x = Math.floor(Math.random() * span) + minV;
  const y = Math.floor(Math.random() * span) + minV;
  const n = x * x + y * y;

  const allPairs = findAllSquareSumPairs(n);

  return { n, allPairs };
};



const findAllSquareSumPairs = (n) => {
  const pairs = [];
  const maxX = Math.floor(Math.sqrt(n));
  const seen = new Set(); 

  
  for (let x = 0; x <= maxX; x++) {
    const xSquared = x * x;
    const ySquared = n - xSquared;

    if (ySquared < 0) break;

    const y = Math.sqrt(ySquared);
    if (Number.isInteger(y) && y >= 0) {
      
      const variants = [];

      
      if (x === 0 && y === 0) {
        
        variants.push([0, 0]);
      } else if (x === 0) {
        
        variants.push([0, y], [0, -y]);
      } else if (y === 0) {
        
        variants.push([x, 0], [-x, 0]);
      } else {
        
        variants.push([x, y], [-x, y], [x, -y], [-x, -y]);
      }

      
      if (x !== y && x !== 0 && y !== 0) {
        variants.push([y, x], [-y, x], [y, -x], [-y, -x]);
      }

      
      variants.forEach(([a, b]) => {
        const key = `${a},${b}`;
        if (!seen.has(key)) {
          pairs.push([a, b]);
          seen.add(key);
        }
      });
    }
  }

  
  return pairs.sort((a, b) => {
    if (a[0] !== b[0]) return a[0] - b[0];
    return a[1] - b[1];
  });
};


const getSquareSumPlotTransform = (width, height, pixelMargin) => {
  const pm = pixelMargin;
  const xs = [];
  const ys = [];
  const add = (x, y) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    xs.push(x);
    ys.push(y);
  };
  (squareSumAllPairs || []).forEach(([a, b]) => add(a, b));
  (squareSumUserPairs || []).forEach((p) => add(p.x, p.y));
  const R = squareSumN !== null && squareSumN >= 0 ? Math.sqrt(squareSumN) : 0;
  if (xs.length === 0 && squareSumN !== null && squareSumN > 0) {
    add(-R, 0);
    add(R, 0);
    add(0, R);
    add(0, -R);
  }
  if (xs.length === 0) {
    add(-2, -2);
    add(2, 2);
  }
  let minX = Math.min(...xs, -R);
  let maxX = Math.max(...xs, R);
  let minY = Math.min(...ys, -R);
  let maxY = Math.max(...ys, R);
  if (maxX === minX) {
    minX -= 1;
    maxX += 1;
  }
  if (maxY === minY) {
    minY -= 1;
    maxY += 1;
  }
  const padX = Math.max((maxX - minX) * 0.12, 0.5);
  const padY = Math.max((maxY - minY) * 0.12, 0.5);
  const spanX = maxX - minX + 2 * padX;
  const spanY = maxY - minY + 2 * padY;
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  let plotScale = Math.min((width - 2 * pm) / spanX, (height - 2 * pm) / spanY);
  if (!Number.isFinite(plotScale) || plotScale <= 0) plotScale = 15;
  plotScale = Math.min(plotScale, 200);
  plotScale = Math.max(plotScale, 0.35);

  const mathToPx = (x, y) => ({
    px: width / 2 + (x - midX) * plotScale,
    py: height / 2 - (y - midY) * plotScale
  });

  return { mathToPx, plotScale };
};


const drawSquareSumPlane = () => {
  if (!squareSumCanvas || !squareSumCtx) return;

  const canvas = squareSumCanvas;
  const ctx = squareSumCtx;
  const width = canvas.width;
  const height = canvas.height;
  const pixelMargin = 28;
  const { mathToPx, plotScale } = getSquareSumPlotTransform(width, height, pixelMargin);
  const gridStep = 15;
  const axisColor =
    getComputedStyle(document.body).getPropertyValue('--viz-axis-color').trim() || '#60a5fa';

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle =
    getComputedStyle(document.body).getPropertyValue('--viz-canvas-bg').trim() ||
    getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() ||
    '#f0f3f8';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border') || '#334155';
  ctx.lineWidth = 0.5;

  for (let gx = 0; gx <= width; gx += gridStep) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, height);
    ctx.stroke();
  }
  for (let gy = 0; gy <= height; gy += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(width, gy);
    ctx.stroke();
  }

  const origin = mathToPx(0, 0);

  ctx.strokeStyle = axisColor;
  ctx.lineWidth = 2;
  if (origin.py >= 0 && origin.py <= height) {
    ctx.beginPath();
    ctx.moveTo(0, origin.py);
    ctx.lineTo(width, origin.py);
    ctx.stroke();
  }
  if (origin.px >= 0 && origin.px <= width) {
    ctx.beginPath();
    ctx.moveTo(origin.px, 0);
    ctx.lineTo(origin.px, height);
    ctx.stroke();
  }

  const labelColor =
    getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#334155';
  ctx.fillStyle = labelColor;
  ctx.font = '12px Inter';
  const xLabelY = Math.min(Math.max(origin.py - 8, 14), height - 8);
  ctx.fillText('x', width - 20, xLabelY);
  ctx.fillText('y', Math.min(origin.px + 8, width - 28), 16);
  if (origin.px >= 8 && origin.px <= width - 8 && origin.py >= 14 && origin.py <= height - 8) {
    ctx.fillText('0', origin.px - 14, origin.py + 16);
  }

  if (squareSumN !== null && squareSumN > 0) {
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    const radiusPx = Math.sqrt(squareSumN) * plotScale;
    ctx.beginPath();
    ctx.arc(origin.px, origin.py, radiusPx, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  const viewMargin = 6;
  if (squareSumUserPairs && squareSumUserPairs.length > 0) {
    squareSumUserPairs.forEach((p) => {
      const { x, y, onCircle } = p;
      const inSet = onCircle && squareSumPairInSolution(x, y);
      const isCorrect = inSet;
      const { px, py } = mathToPx(x, y);
      if (
        px < viewMargin ||
        px > width - viewMargin ||
        py < viewMargin ||
        py > height - viewMargin
      ) {
        return;
      }

      ctx.fillStyle = isCorrect ? '#10b981' : '#ef4444';
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = isCorrect ? '#10b981' : '#ef4444';
      ctx.font = '10px Inter';
      ctx.fillText(`(${x}, ${y})`, px + 8, py - 8);
    });
  }

  if (squareSumTaskFinished && squareSumAllPairs && squareSumAllPairs.length > 0 && squareSumUserPairs) {
    squareSumAllPairs.forEach(([x, y]) => {
      const wasEntered = squareSumUserPairs.some((p) => p.x === x && p.y === y);

      if (!wasEntered) {
        const { px, py } = mathToPx(x, y);

        ctx.fillStyle = 'rgba(249, 115, 22, 0.5)';
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#f97316';
        ctx.font = '10px Inter';
        ctx.fillText(`(${x}, ${y})`, px + 8, py - 8);
      }
    });
  }
};

const showSquareSumVisualization = () => {
  const intro = qs('#squareSumIntro');
  const viz = qs('#squareSumVizWrapper');
  if (intro) intro.style.display = 'none';
  if (viz) viz.style.display = 'flex';
  drawSquareSumPlane();
};

const hideSquareSumVisualization = () => {
  const intro = qs('#squareSumIntro');
  const viz = qs('#squareSumVizWrapper');
  if (intro) intro.style.display = 'block';
  if (viz) viz.style.display = 'none';
};


const initSquareSumTask = () => {
  const taskTextEl = qs('#squareSumTaskText');
  const pairRows = getSquareSumPairRowsContainer();
  const inputSection = qs('#inputSection');
  const resultSection = qs('#resultSection');

  if (!taskTextEl || !pairRows) return;

  const task = generateSquareSumTask(getSquareSumDifficulty());
  squareSumN = task.n;
  squareSumAllPairs = task.allPairs;
  squareSumUserPairs = [];
  squareSumTaskFinished = false;
  squareSumHintRevealed = false;

  const hintBtnEl = qs('#squareSumHintBtn');
  if (hintBtnEl) hintBtnEl.disabled = false;

  const pairRowCount = squareSumAllPairs.length;
  const s1 = squareSumSubscriptNumber(1);
  const sm = squareSumSubscriptNumber(pairRowCount);
  const rowNoun =
    pairRowCount % 10 === 1 && pairRowCount % 100 !== 11
      ? 'рядок'
      : [2, 3, 4].includes(pairRowCount % 10) && ![12, 13, 14].includes(pairRowCount % 100)
        ? 'рядки'
        : 'рядків';
  const labelsPhrase =
    pairRowCount === 1
      ? `з підписами x${s1}, y${s1}`
      : `з підписами x${s1}, y${s1}, …, x${sm}, y${sm}`;
  let text = `Дано число <math><mi>n</mi> <mo>=</mo> <mn>${squareSumN}</mn><mo>.</mo></math> Знайдіть усі цілі пари <math><mtext>(</mtext><mi>x</mi><mo>,</mo><mi>y</mi><mtext>)</mtext><mo>,</mo></math> для яких <math><msup><mi>x</mi> <mn>2</mn></msup> <mo>+</mo> <msup><mi>y</mi> <mn>2</mn></msup> <mo>=</mo> <mi>n</mi><mo>.</mo></math> Нижче у кожному рядку введіть одну цілу пару чисел. Порядок пар не важливий. Натисніть «Перевірити», коли заповните всі рядки.<br> <strong>Примітка:</strong> рівняння <math><msup><mi>x</mi> <mn>2</mn></msup> <mo>+</mo> <msup><mi>y</mi> <mn>2</mn></msup> <mo>=</mo> <mi>n</mi></math> має геометричну інтерпритацію - це коло з радіусом <math><mo>&#8730;</mo><mi>n</mi></math>, а пари <math><mtext>(</mtext><mi>x</mi><mo>,</mo><mi>y</mi><mtext>)</mtext></math> - це цілочисельні координати точок на колі. Після перевірки ви побачите візуалізацію з введеними точками на колі. Підказка покаже всі правильні пари та їх розташування на колі.`;
  taskTextEl.innerHTML = text;
  resetSquareSumPairRows(pairRowCount);
  syncSquareSumUserPairsFromRows();

  
  inputSection.style.display = 'block';
  resultSection.style.display = 'none';

  hideSquareSumVisualization();

  const finishBtnReset = qs('#finishBtn');
  if (finishBtnReset) finishBtnReset.textContent = 'Перевірити';
};

const applySquareSumHint = () => {
  if (squareSumN === null || squareSumHintRevealed || squareSumTaskFinished) return;
  const container = getSquareSumPairRowsContainer();
  const finishBtn = qs('#finishBtn');
  if (!container) return;

  squareSumUserPairs = squareSumAllPairs.map(([a, b]) => ({
    x: a,
    y: b,
    onCircle: true
  }));
  squareSumHintRevealed = true;
  squareSumTaskFinished = true;

  container.innerHTML = '';
  squareSumAllPairs.forEach(([x, y], i) => {
    container.appendChild(
      createSquareSumPairRow(i, { disabled: true, x, y })
    );
  });

  if (squareSumHintBtn) squareSumHintBtn.disabled = true;
  if (finishBtn) finishBtn.textContent = 'Нове завдання';

  showSquareSumVisualization();
};


const finishSquareSumTask = () => {
  if (squareSumHintRevealed) return;
  const resultContent = qs('#resultContent');
  const inputSection = qs('#inputSection');
  const resultSection = qs('#resultSection');

  if (!resultContent || !squareSumN) return;

  syncSquareSumUserPairsFromRows();

  
  const correctPairs = [];
  const incorrectPairs = [];
  const missedPairs = [];

  squareSumUserPairs.forEach(({ x, y, onCircle }) => {
    const isCorrect = onCircle && squareSumPairInSolution(x, y);
    if (isCorrect) {
      correctPairs.push([x, y]);
    } else {
      incorrectPairs.push([x, y]);
    }
  });

  squareSumAllPairs.forEach(([a, b]) => {
    const wasFound = squareSumUserPairs.some((p) => p.x === a && p.y === b);
    if (!wasFound) {
      missedPairs.push([a, b]);
    }
  });

  const totalPairs = squareSumAllPairs.length;
  const foundPairs = correctPairs.length;
  const incorrectCount = incorrectPairs.length;

  
  let score = foundPairs - incorrectCount * 1;
  if (score < 0) score = 0;
  const maxScore = totalPairs;
  const percentage = totalPairs > 0 ? ((score / maxScore) * 100) : 0;

  
  const grade12 = (percentage / 100) * 12;
  const finalGrade = Math.max(0, Math.min(12, Math.round(grade12)));

  
  let resultHTML = '<div style="margin-bottom: 12px;"><strong>Результати:</strong></div>';

  resultHTML += `<div style="margin: 8px 0;">
    Знайдено правильних пар: ${foundPairs} / ${totalPairs}
  </div>`;

  if (correctPairs.length > 0) {
    resultHTML += `<div style="margin: 8px 0; color: #10b981;">
      ${ICON_FB_OK} Правильні пари: ${correctPairs.map(([x, y]) => `(${x}, ${y})`).join(', ')}
    </div>`;
  }

  if (incorrectPairs.length > 0) {
    resultHTML += `<div style="margin: 8px 0; color: #ef4444;">
      ${ICON_FB_FAIL} Неправильні пари: ${incorrectPairs.map(([x, y]) => `(${x}, ${y})`).join(', ')}
    </div>`;
  }

  if (missedPairs.length > 0) {
    resultHTML += `<div style="margin: 8px 0; color: #f97316;">
      ${ICON_FB_WARN} Пропущені пари: ${missedPairs.map(([x, y]) => `(${x}, ${y})`).join(', ')}
    </div>`;
  }

  resultHTML += `<div class="score-result-block">
    Оцінка: ${finalGrade} / 12
  </div>`;

  resultContent.innerHTML = resultHTML;

  squareSumTaskFinished = true;
  showSquareSumVisualization();

  inputSection.style.display = 'none';
  resultSection.style.display = 'block';
};

const handleSquareSumCheckOrRepeat = () => {
  const finishBtn = qs('#finishBtn');
  if (!finishBtn) return;
  if (finishBtn.textContent === 'Нове завдання') {
    initSquareSumTask();
    return;
  }
  finishSquareSumTask();
};


squareSumCanvas = qs('#coordinateCanvas');
const squareSumFinishBtn = qs('#finishBtn');
const squareSumHintBtn = qs('#squareSumHintBtn');
const squareSumNewTaskBtn = qs('#newTaskBtn');


if (squareSumCanvas && qs('#squareSumTaskText')) {
  squareSumCtx = squareSumCanvas.getContext('2d');

  if (squareSumFinishBtn) {
    squareSumFinishBtn.addEventListener('click', handleSquareSumCheckOrRepeat);
  }

  if (squareSumHintBtn) {
    squareSumHintBtn.addEventListener('click', applySquareSumHint);
  }

  if (squareSumNewTaskBtn) {
    squareSumNewTaskBtn.addEventListener('click', initSquareSumTask);
  }

  document.querySelectorAll('input[name="squareSumDifficulty"]').forEach((input) => {
    input.addEventListener('change', () => {
      initSquareSumTask();
    });
  });

  initSquareSumTask();
}


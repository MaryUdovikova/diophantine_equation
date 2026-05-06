

let hiperK = null;
let hiperAllPairs = [];
let hiperUserPairs = [];
let hiperCanvas = null;
let hiperCtx = null;
let hiperTaskFinished = false;
let hiperHintRevealed = false;

const hiperPairInSolution = (x, y) =>
  hiperAllPairs.some(([a, b]) => a === x && b === y);

const getHiperPairRowsContainer = () => qs('#hiperPairRows');

const getHiperPairRows = () => {
  const c = getHiperPairRowsContainer();
  return c ? [...c.querySelectorAll('.square-sum-pair-row')] : [];
};

const parseHiperIntInput = (input) => {
  if (!input || input.value.trim() === '') return null;
  const n = Number(input.value);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  return n;
};

const syncHiperUserPairsFromRows = () => {
  hiperUserPairs = [];
  if (hiperK === null) return;
  const seen = new Set();
  for (const row of getHiperPairRows()) {
    const ix = row.querySelector('.square-sum-pair-x');
    const iy = row.querySelector('.square-sum-pair-y');
    const vx = parseHiperIntInput(ix);
    const vy = parseHiperIntInput(iy);
    if (vx === null || vy === null) continue;
    const key = `${vx},${vy}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const onCurve = vx * vy === hiperK;
    hiperUserPairs.push({ x: vx, y: vy, onCurve });
  }
};

const onHiperPairRowInput = () => {
  syncHiperUserPairsFromRows();
  const viz = qs('#hiperVizWrapper');
  if (viz && viz.style.display === 'block') drawHiperPlane();
};

const createHiperPairRow = (pairIndex, opts = {}) => {
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
    ix.addEventListener('input', onHiperPairRowInput);
    iy.addEventListener('input', onHiperPairRowInput);
  }

  return row;
};

const resetHiperPairRows = (rowCount) => {
  const container = getHiperPairRowsContainer();
  if (!container) return;
  container.innerHTML = '';
  const n = Math.max(1, rowCount);
  for (let i = 0; i < n; i += 1) {
    container.appendChild(createHiperPairRow(i));
  }
};

const getHiperDifficulty = () => {
  const r = document.querySelector('input[name="hiperDifficulty"]:checked');
  return r ? r.value : 'medium';
};

const generateHiperTask = (difficulty) => {
  const level = difficulty || getHiperDifficulty();
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
  const k = x * y;
  const allPairs = findAllHiperPairs(k);
  return { k, allPairs };
};

const findAllHiperPairs = (k) => {
  const pairs = [];
  const seen = new Set();

  if (k === 0) {
    for (let x = -15; x <= 15; x += 1) {
      if (x !== 0) {
        const key1 = `${x},0`;
        if (!seen.has(key1)) {
          pairs.push([x, 0]);
          seen.add(key1);
        }
      }
    }
    for (let y = -15; y <= 15; y += 1) {
      if (y !== 0) {
        const key2 = `0,${y}`;
        if (!seen.has(key2)) {
          pairs.push([0, y]);
          seen.add(key2);
        }
      }
    }
    pairs.push([0, 0]);
  } else {
    const absK = Math.abs(k);
    const divisors = new Set();

    for (let i = 1; i * i <= absK; i += 1) {
      if (absK % i === 0) {
        divisors.add(i);
        divisors.add(absK / i);
      }
    }

    divisors.forEach((d) => {
      const yVal = k / d;
      const variants = [
        [d, yVal],
        [-d, -yVal]
      ];

      variants.forEach(([xv, yv]) => {
        const key = `${xv},${yv}`;
        if (!seen.has(key)) {
          pairs.push([xv, yv]);
          seen.add(key);
        }
      });
    });
  }

  return pairs.sort((a, b) => {
    if (a[0] !== b[0]) return a[0] - b[0];
    return a[1] - b[1];
  });
};


const getHiperPlotTransform = (width, height, pixelMargin) => {
  const pm = pixelMargin;
  const xs = [];
  const ys = [];
  const addPt = (x, y) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    xs.push(x);
    ys.push(y);
  };
  (hiperAllPairs || []).forEach(([a, b]) => addPt(a, b));
  (hiperUserPairs || []).forEach((p) => addPt(p.x, p.y));
  if (hiperK !== null && hiperK !== 0 && xs.length === 0) {
    addPt(1, hiperK);
    addPt(-1, -hiperK);
  }
  if (xs.length === 0) {
    addPt(-2, -2);
    addPt(2, 2);
  }
  let minX = Math.min(...xs);
  let maxX = Math.max(...xs);
  let minY = Math.min(...ys);
  let maxY = Math.max(...ys);
  if (maxX === minX) {
    minX -= 1;
    maxX += 1;
  }
  if (maxY === minY) {
    minY -= 1;
    maxY += 1;
  }
  const padX = Math.max((maxX - minX) * 0.14, 1);
  const padY = Math.max((maxY - minY) * 0.14, 1);
  const spanX = maxX - minX + 2 * padX;
  const spanY = maxY - minY + 2 * padY;
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  let plotScale = Math.min((width - 2 * pm) / spanX, (height - 2 * pm) / spanY);
  if (!Number.isFinite(plotScale) || plotScale <= 0) plotScale = 6;
  plotScale = Math.min(plotScale, 200);
  plotScale = Math.max(plotScale, 0.35);

  const mathToPx = (x, y) => ({
    px: width / 2 + (x - midX) * plotScale,
    py: height / 2 - (y - midY) * plotScale
  });

  return { mathToPx, plotScale, midX, midY };
};

const drawPointLabel = (ctx, px, py, x, y, width, height, minMargin, color) => {
  const labelText = `(${x}, ${y})`;
  ctx.font = '11px Inter';
  const textWidth = ctx.measureText(labelText).width;
  const textHeight = 11;
  const offset = 10;

  let labelX;
  let labelY;

  if (px > width - textWidth - offset - minMargin) {
    labelX = px - textWidth - offset;
  } else {
    labelX = px + offset;
  }

  if (py < textHeight + offset + minMargin) {
    labelY = py + offset + textHeight;
  } else {
    labelY = py - offset;
  }

  if (
    labelX >= minMargin &&
    labelX + textWidth <= width - minMargin &&
    labelY >= textHeight + minMargin &&
    labelY <= height - minMargin
  ) {
    ctx.fillStyle = color;
    ctx.fillText(labelText, labelX, labelY);
  }
};

const drawHiperPlane = () => {
  if (!hiperCanvas || !hiperCtx) return;

  const canvas = hiperCanvas;
  const ctx = hiperCtx;
  const width = canvas.width;
  const height = canvas.height;
  const pixelMargin = 28;
  const { mathToPx, plotScale, midX } = getHiperPlotTransform(width, height, pixelMargin);
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

  const xLeft = midX - (width / 2 - pixelMargin) / plotScale;
  const xRight = midX + (width / 2 - pixelMargin) / plotScale;
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

  ctx.fillStyle = '#e5e7eb';
  ctx.font = '12px Inter';
  const xLabelY = Math.min(Math.max(origin.py - 8, 14), height - 8);
  ctx.fillText('x', width - 20, xLabelY);
  ctx.fillText('y', Math.min(origin.px + 8, width - 28), 16);
  if (origin.px >= 8 && origin.px <= width - 8 && origin.py >= 14 && origin.py <= height - 8) {
    ctx.fillText('0', origin.px - 14, origin.py + 16);
  }

  if (hiperK !== null) {
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    if (hiperK !== 0) {
      const xSpan = xRight - xLeft;
      const steps = Math.min(5000, Math.max(200, Math.ceil(xSpan / Math.max(Math.abs(hiperK) * 0.001, 0.03))));
      const step = xSpan / steps;
      const xGap = Math.max(0.06, Math.abs(xRight - xLeft) * 1e-4);

      const strokeBranch = (from, to) => {
        if (from > to) return;
        let hasActiveSegment = false;
        const flush = () => {
          if (hasActiveSegment) {
            ctx.stroke();
            hasActiveSegment = false;
          }
        };
        for (let xv = from; xv <= to + step * 0.5; xv += step) {
          if (Math.abs(xv) < xGap) {
            flush();
            continue;
          }
          const yv = hiperK / xv;
          const { px, py } = mathToPx(xv, yv);
          const inBounds = px >= -2 && px <= width + 2 && py >= -2 && py <= height + 2;
          if (!inBounds) {
            flush();
            continue;
          }
          if (!hasActiveSegment) {
            ctx.beginPath();
            ctx.moveTo(px, py);
            hasActiveSegment = true;
          } else {
            ctx.lineTo(px, py);
          }
        }
        flush();
      };

      if (xLeft < -xGap) {
        const endNeg = Math.min(-xGap, xRight);
        if (endNeg >= xLeft) strokeBranch(xLeft, endNeg);
      }
      if (xRight > xGap) {
        const startPos = Math.max(xGap, xLeft);
        if (startPos <= xRight) strokeBranch(startPos, xRight);
      }
    }

    ctx.setLineDash([]);
  }

  const viewMargin = 8;
  if (hiperUserPairs && hiperUserPairs.length > 0) {
    hiperUserPairs.forEach((p) => {
      const { x, y } = p;
      const inSet = p.onCurve && hiperPairInSolution(x, y);
      const isCorrect = inSet;
      const { px, py } = mathToPx(x, y);

      if (
        !isFinite(px) ||
        !isFinite(py) ||
        isNaN(px) ||
        isNaN(py) ||
        px < viewMargin ||
        px > width - viewMargin ||
        py < viewMargin ||
        py > height - viewMargin
      ) {
        return;
      }

      const color = isCorrect ? '#10b981' : '#ef4444';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      drawPointLabel(ctx, px, py, x, y, width, height, 5, color);
    });
  }

  if (hiperTaskFinished && hiperAllPairs && hiperAllPairs.length > 0 && hiperUserPairs) {
    hiperAllPairs.forEach(([x, y]) => {
      const wasEntered = hiperUserPairs.some((p) => p.x === x && p.y === y);

      if (!wasEntered) {
        const { px, py } = mathToPx(x, y);

        if (!isFinite(px) || !isFinite(py) || isNaN(px) || isNaN(py)) {
          return;
        }

        const pointRadius = 3;
        const minMargin = 5;

        if (
          px < -pointRadius ||
          px > width + pointRadius ||
          py < -pointRadius ||
          py > height + pointRadius
        ) {
          return;
        }

        ctx.fillStyle = 'rgba(249, 115, 22, 0.5)';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        drawPointLabel(ctx, px, py, x, y, width, height, minMargin, '#f97316');
      }
    });
  }
};

const showHiperVisualization = () => {
  const intro = qs('#hiperIntro');
  const viz = qs('#hiperVizWrapper');
  if (intro) intro.style.display = 'none';
  if (viz) viz.style.display = 'block';
  drawHiperPlane();
};

const hideHiperVisualization = () => {
  const intro = qs('#hiperIntro');
  const viz = qs('#hiperVizWrapper');
  if (intro) intro.style.display = 'block';
  if (viz) viz.style.display = 'none';
};

const initHiperTask = () => {
  const taskKValue = qs('#hiperTaskKValue');
  const pairRows = getHiperPairRowsContainer();
  const inputSection = qs('#hiperInputSection');
  const resultSection = qs('#hiperResultSection');

  if (!taskKValue || !pairRows) return;

  const task = generateHiperTask(getHiperDifficulty());
  hiperK = task.k;
  hiperAllPairs = task.allPairs;
  hiperUserPairs = [];
  hiperTaskFinished = false;
  hiperHintRevealed = false;

  const hintBtnEl = qs('#hiperHintBtn');
  if (hintBtnEl) hintBtnEl.disabled = false;

  taskKValue.textContent = String(hiperK);

  resetHiperPairRows(hiperAllPairs.length);
  syncHiperUserPairsFromRows();

  if (inputSection) inputSection.style.display = 'block';
  if (resultSection) resultSection.style.display = 'none';

  hideHiperVisualization();

  const checkBtn = qs('#hiperCheckBtn');
  if (checkBtn) checkBtn.textContent = 'Перевірити';
};

const applyHiperHint = () => {
  if (hiperK === null || hiperHintRevealed || hiperTaskFinished) return;
  const container = getHiperPairRowsContainer();
  const finishBtn = qs('#hiperCheckBtn');
  const hintBtn = qs('#hiperHintBtn');
  if (!container) return;

  hiperUserPairs = hiperAllPairs.map(([a, b]) => ({
    x: a,
    y: b,
    onCurve: true
  }));
  hiperHintRevealed = true;
  hiperTaskFinished = true;

  container.innerHTML = '';
  hiperAllPairs.forEach(([x, y], i) => {
    container.appendChild(createHiperPairRow(i, { disabled: true, x, y }));
  });

  if (hintBtn) hintBtn.disabled = true;
  if (finishBtn) finishBtn.textContent = 'Нове завдання';

  showHiperVisualization();
};

const finishHiperTask = () => {
  if (hiperHintRevealed) return;
  const resultContent = qs('#hiperResultContent');
  const inputSection = qs('#hiperInputSection');
  const resultSection = qs('#hiperResultSection');

  if (!resultContent || hiperK === null) return;

  syncHiperUserPairsFromRows();

  const correctPairs = [];
  const incorrectPairs = [];
  const missedPairs = [];

  hiperUserPairs.forEach(({ x, y, onCurve }) => {
    const isCorrect = onCurve && hiperPairInSolution(x, y);
    if (isCorrect) {
      correctPairs.push([x, y]);
    } else {
      incorrectPairs.push([x, y]);
    }
  });

  hiperAllPairs.forEach(([a, b]) => {
    const wasFound = hiperUserPairs.some((p) => p.x === a && p.y === b);
    if (!wasFound) {
      missedPairs.push([a, b]);
    }
  });

  const totalPairs = hiperAllPairs.length;
  const foundPairs = correctPairs.length;
  const incorrectCount = incorrectPairs.length;

  let score = foundPairs - incorrectCount * 1;
  if (score < 0) score = 0;
  const maxScore = totalPairs;
  const percentage = totalPairs > 0 ? (score / maxScore) * 100 : 0;

  const grade12 = (percentage / 100) * 12;
  const finalGrade = Math.max(0, Math.min(12, Math.round(grade12)));

  let resultHTML = '<div style="margin-bottom: 12px;"><strong>Результати:</strong></div>';

  resultHTML += `<div style="margin: 8px 0;">
    Число k = ${hiperK}
  </div>`;

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

  resultHTML += `<div style="margin-top: 16px; padding: 12px; background: rgba(56, 189, 248, 0.1); border-radius: 8px;">
    Всі можливі пари для k = ${hiperK}:<br>
    ${hiperAllPairs.map(([x, y]) => `(${x}, ${y})`).join(', ')}
  </div>`;

  resultContent.innerHTML = resultHTML;

  hiperTaskFinished = true;
  showHiperVisualization();

  if (inputSection) inputSection.style.display = 'none';
  if (resultSection) resultSection.style.display = 'block';
};

const handleHiperCheckOrRepeat = () => {
  const btn = qs('#hiperCheckBtn');
  if (!btn) return;
  if (btn.textContent === 'Нове завдання') {
    initHiperTask();
    return;
  }
  finishHiperTask();
};

hiperCanvas = qs('#hiperCanvas');
const hiperCheckBtn = qs('#hiperCheckBtn');
const hiperHintBtn = qs('#hiperHintBtn');
const hiperNewTaskBtn = qs('#hiperNewTaskBtn');

if (hiperCanvas && qs('#hiperTaskKValue') && qs('#hiperPairRows')) {
  hiperCtx = hiperCanvas.getContext('2d');

  if (hiperCheckBtn) {
    hiperCheckBtn.addEventListener('click', handleHiperCheckOrRepeat);
  }

  if (hiperHintBtn) {
    hiperHintBtn.addEventListener('click', applyHiperHint);
  }

  if (hiperNewTaskBtn) {
    hiperNewTaskBtn.addEventListener('click', initHiperTask);
  }

  document.querySelectorAll('input[name="hiperDifficulty"]').forEach((input) => {
    input.addEventListener('change', () => {
      initHiperTask();
    });
  });

  initHiperTask();
}


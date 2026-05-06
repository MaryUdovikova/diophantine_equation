


const getPythCanvasColors = () => {
  const style = getComputedStyle(document.body);
  const pick = (name, fallback) => {
    const v = style.getPropertyValue(name).trim();
    return v || fallback;
  };
  return {
    bg: pick('--pyth-canvas-bg', '#0b172e'),
    stroke: pick('--pyth-canvas-stroke', '#38bdf8'),
    fill: pick('--pyth-canvas-fill', 'rgba(56, 189, 248, 0.12)'),
    label: pick('--pyth-canvas-label', '#e5e7eb'),
  };
};


const taskSection = qs('#taskSection');
const taskAInput = qs('#taskA');
const taskBInput = qs('#taskB');
const checkCurrentTaskBtn = qs('#checkCurrentTask');
const pythagoreanHintBtn = qs('#pythagoreanHintBtn');
const nextTaskBtn = qs('#nextTask');
const taskResult = qs('#taskResult');
const taskScore = qs('#taskScore');
const pythExampleIntro = qs('#pythagoreanExampleIntro');
const taskCanvasWrapper = qs('#taskCanvasWrapper');


const showPythExampleOnly = () => {
  if (pythExampleIntro) pythExampleIntro.style.display = '';
  if (taskCanvasWrapper) taskCanvasWrapper.style.display = 'none';
};

const showPythTriangleOnly = () => {
  if (pythExampleIntro) pythExampleIntro.style.display = 'none';
  if (taskCanvasWrapper) taskCanvasWrapper.style.display = 'block';
};

let currentTask = null;
let taskScoreValue = 0; 

const getPythagoreanDifficulty = () => {
  const r = document.querySelector('input[name="pythagoreanDifficulty"]:checked');
  return r ? r.value : 'medium';
};


const generatePythagoreanTriple = (difficulty) => {
  const level = difficulty || getPythagoreanDifficulty();
  const allTriples = [
    [3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29],
    [12, 35, 37], [9, 40, 41], [28, 45, 53], [11, 60, 61], [16, 63, 65],
    [33, 56, 65], [48, 55, 73], [13, 84, 85], [36, 77, 85], [39, 80, 89]
  ];
  let pool;
  switch (level) {
    case 'easy':
      pool = allTriples.filter((t) => t[2] <= 25);
      break;
    case 'hard':
      pool = allTriples.filter((t) => t[2] > 55);
      break;
    case 'medium':
    default:
      pool = allTriples.filter((t) => t[2] > 25 && t[2] <= 55);
      break;
  }
  if (pool.length === 0) pool = allTriples;
  const randomTriple = pool[Math.floor(Math.random() * pool.length)];
  const [a, b, c] = randomTriple;
  return Math.random() > 0.5 ? [a, b, c] : [b, a, c];
};

const startTask = () => {
  if (!taskSection) return;

  showPythExampleOnly();

  if (!taskAInput || !taskBInput || !checkCurrentTaskBtn) return;

  currentTask = generatePythagoreanTriple(getPythagoreanDifficulty());
  const [, , c] = currentTask;

  taskAInput.value = '';
  taskBInput.value = '';
  const taskIntro = qs('#pythagoreanTaskIntro');
  if (taskIntro) {
    taskIntro.textContent = `Дано прямокутний трикутник з гіпотенузою ${c}. Знайти катети що задовольняють цьому трикутнику.`;
  }
  taskAInput.focus();
  checkCurrentTaskBtn.style.display = 'block';
  checkCurrentTaskBtn.textContent = 'Перевірити';
  if (pythagoreanHintBtn) pythagoreanHintBtn.style.display = 'block';

  taskSection.style.display = 'block';
  if (nextTaskBtn) nextTaskBtn.style.display = 'none';
  if (taskResult) {
    taskResult.textContent = '';
    taskResult.style.color = '';
  }
  if (taskScore) {
    taskScore.textContent = '';
    taskScore.style.display = 'none';
  }
  
  
  const taskCanvas = qs('#taskTriangleCanvas');
  if (taskCanvas) {
    const taskCtx = taskCanvas.getContext('2d');
    if (taskCtx) {
      const col = getPythCanvasColors();
      taskCtx.clearRect(0, 0, taskCanvas.width, taskCanvas.height);
      taskCtx.fillStyle = col.bg;
      taskCtx.fillRect(0, 0, taskCanvas.width, taskCanvas.height);
    }
  }
};

const checkCurrentTask = () => {
  if (!currentTask || !taskResult || !taskScore || !checkCurrentTaskBtn) return;

  if (!taskAInput || !taskBInput) return;
  
  const userA = Number(taskAInput.value);
  const userB = Number(taskBInput.value);
  const [, , correctC] = currentTask;
  
  if ([userA, userB].some((n) => Number.isNaN(n) || n <= 0)) {
    taskResult.textContent = 'Введіть додатні числа для катетів.';
    taskResult.style.color = '#ef4444';
    return;
  }
  
  const isPythagorean = (userA * userA + userB * userB === correctC * correctC);
  const [a, b] = currentTask;
  const matchesOriginal =
    (userA === a && userB === b) ||
    (userA === b && userB === a);

  taskScoreValue = 0;
  if (isPythagorean && matchesOriginal) {
    taskResult.innerHTML = `${ICON_FB_OK} Правильно! Катети підібрані вірно до заданої гіпотенузи.`;
    taskResult.style.color = '#10b981';
    taskScoreValue = 6;
  } else if (isPythagorean) {
    taskResult.innerHTML = `${ICON_FB_INFO} Катети утворюють правильну Піфагорову трійку з цією гіпотенузою, але не збігаються з очікуваною трійкою.`;
    taskResult.style.color = '#f59e0b';
  } else {
    taskResult.innerHTML = `${ICON_FB_FAIL} Неправильно. Для цієї гіпотенузи очікувана трійка: a = ${a}, b = ${b}, c = ${correctC}.`;
    taskResult.style.color = '#ef4444';
  }

  const maxPoints = 6;
  const grade12 = Math.round((taskScoreValue / maxPoints) * 12);

  taskScore.textContent = `Оцінка: ${grade12} / 12`;
  taskScore.style.display = 'block';

  checkCurrentTaskBtn.style.display = 'none';
  if (pythagoreanHintBtn) pythagoreanHintBtn.style.display = 'none';
  if (nextTaskBtn) nextTaskBtn.style.display = 'block';

  showPythTriangleOnly();

  
  const taskCanvas = qs('#taskTriangleCanvas');
  if (taskCanvas) {
    const taskCtx = taskCanvas.getContext('2d');
    if (taskCtx) {
      drawTriangleOnCanvas(taskCanvas, taskCtx, a, b, correctC);
    }
  }
};

const applyPythagoreanHint = () => {
  if (!currentTask || !taskAInput || !taskBInput || !checkCurrentTaskBtn) return;
  const [a, b, c] = currentTask;
  taskAInput.value = String(a);
  taskBInput.value = String(b);
  checkCurrentTaskBtn.textContent = 'Нове завдання';

  showPythTriangleOnly();

  const taskCanvas = qs('#taskTriangleCanvas');
  if (taskCanvas) {
    const taskCtx = taskCanvas.getContext('2d');
    if (taskCtx) {
      drawTriangleOnCanvas(taskCanvas, taskCtx, a, b, c);
    }
  }
};

const handlePythagoreanCheckOrRepeat = () => {
  if (!checkCurrentTaskBtn) return;
  if (checkCurrentTaskBtn.textContent === 'Нове завдання') {
    startTask();
    return;
  }
  checkCurrentTask();
};


const drawTriangleOnCanvas = (canvas, ctx, a, b, c) => {
  const col = getPythCanvasColors();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = col.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const marginLeft = 24;
  const marginRight = 60;
  const marginTop = 24;
  const marginBottom = 24;
  
  const availableWidth = canvas.width - marginLeft - marginRight;
  const availableHeight = canvas.height - marginTop - marginBottom;
  
  const scaleX = availableWidth / a;
  const scaleY = availableHeight / b;
  
  const scale = Math.min(scaleX, scaleY);
  
  const aScaled = a * scale;
  const bScaled = b * scale;

  ctx.strokeStyle = col.stroke;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(marginLeft, canvas.height - marginBottom);
  ctx.lineTo(marginLeft + aScaled, canvas.height - marginBottom);
  ctx.lineTo(marginLeft + aScaled, canvas.height - marginBottom - bScaled);
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = col.fill;
  ctx.fill();

  ctx.fillStyle = col.label;
  ctx.font = '14px Inter';
  const textA = `a = ${a}`;
  const textAWidth = ctx.measureText(textA).width;
  ctx.fillText(textA, marginLeft + aScaled / 2 - textAWidth / 2, canvas.height - marginBottom + 18);
  ctx.fillText(`b = ${b}`, marginLeft + aScaled + 8, canvas.height - marginBottom - bScaled / 2);
  const textC = `c = ${c}`;
  const textCWidth = ctx.measureText(textC).width;
  
  const cX = Math.max(marginLeft, marginLeft + aScaled / 2 - textCWidth - 8);
  const cY = canvas.height - marginBottom - bScaled / 2;
  ctx.fillText(textC, cX, cY);
};

if (checkCurrentTaskBtn) {
  checkCurrentTaskBtn.addEventListener('click', handlePythagoreanCheckOrRepeat);
}
if (pythagoreanHintBtn) {
  pythagoreanHintBtn.addEventListener('click', applyPythagoreanHint);
}
if (nextTaskBtn) {
  nextTaskBtn.addEventListener('click', startTask);
}

document.querySelectorAll('input[name="pythagoreanDifficulty"]').forEach((input) => {
  input.addEventListener('change', () => {
    startTask();
  });
});

if (taskSection && taskAInput && taskBInput) {
  startTask();
}



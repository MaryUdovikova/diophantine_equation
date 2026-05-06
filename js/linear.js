


let currentLinearTask = null;
let linearScore = 0; 

const getLinearDifficulty = () => {
  const r = document.querySelector('input[name="linearDifficulty"]:checked');
  return r ? r.value : 'medium';
};

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;


const randomSign = () => (Math.random() < 0.5 ? 1 : -1);


const formatLinearEquationDisplay = (a, b, c) => {
  let xPart;
  if (a === 1) xPart = 'x';
  else if (a === -1) xPart = '-x';
  else xPart = `${a}x`;

  let yPart;
  if (b >= 0) {
    if (b === 1) yPart = ' + y';
    else yPart = ` + ${b}y`;
  } else {
    const ab = Math.abs(b);
    if (ab === 1) yPart = ' - y';
    else yPart = ` - ${ab}y`;
  }

  return `${xPart}${yPart} = ${c}`;
};


const generateLinearTask = (difficulty) => {
  const level = difficulty || getLinearDifficulty();
  let absA;
  let absB;
  let multMin;
  let multMax;
  switch (level) {
    case 'easy':
      
      absA = randInt(1, 9);
      absB = randInt(1, 9);
      multMin = 3;
      multMax = 12;
      break;
    case 'hard':
      
      absA = randInt(10, 99);
      absB = randInt(10, 99);
      multMin = 8;
      multMax = 40;
      break;
    case 'medium':
    default:
      
      {
        const small = randInt(1, 9);
        const big = randInt(10, 99);
        if (Math.random() < 0.5) {
          absA = small;
          absB = big;
        } else {
          absA = big;
          absB = small;
        }
      }
      multMin = 5;
      multMax = 24;
      break;
  }

  const sa = randomSign();
  const sb = randomSign();
  const a = sa * absA;
  const b = sb * absB;

  
  const { d, x, y } = extendedGcd(absA, absB);

  const multRange = multMax - multMin + 1;
  const multiplier = Math.floor(Math.random() * multRange) + multMin;
  
  const wantUnsolvable = level === 'hard' && d >= 2 && Math.random() < 0.35;
  let c;
  let x0;
  let y0;
  if (wantUnsolvable) {
    const base = d * multiplier;
    const r = randInt(1, d - 1);
    c = base + r;
    x0 = 0;
    y0 = 0;
  } else {
    c = d * multiplier;
    const factor = c / d;
    x0 = x * factor * sa;
    y0 = y * factor * sb;
  }
  const condition = ((c % d) + d) % d;

  return {
    a,
    b,
    c,
    gcd: d,
    condition,
    x0,
    y0
  };
};


const updateConditionDisplay = () => {
  const conditionLabel = qs('#conditionLabel');
  const userGcd = qs('#userGcd');
  
  if (!conditionLabel || !userGcd || !currentLinearTask) return;
  
  const userGcdVal = userGcd.value.trim();
  
  
  let textNode = conditionLabel.firstChild;
  while (textNode && textNode.nodeType !== Node.TEXT_NODE) {
    textNode = textNode.nextSibling;
  }
  
  const c = currentLinearTask.c;
  if (userGcdVal === '' || isNaN(Number(userGcdVal))) {
    const t = `Остача від ділення (${c} mod НСД) = `;
    if (textNode) {
      textNode.textContent = t;
    } else {
      conditionLabel.insertBefore(document.createTextNode(t), conditionLabel.firstChild);
    }
    return;
  }

  const gcdNum = Number(userGcdVal);
  const t = `Остача від ділення (${c} mod ${gcdNum}) = `;
  if (textNode) {
    textNode.textContent = t;
  } else {
    conditionLabel.insertBefore(document.createTextNode(t), conditionLabel.firstChild);
  }
};

const syncLinearSolutionVisibility = () => {
  const fields = qs('#linearSolutionFields');
  const noRadio = qs('input[name="conditionHolds"][value="no"]');
  if (!fields || !noRadio) return;
  if (noRadio.checked) {
    fields.style.display = 'none';
  } else {
    fields.style.display = 'grid';
  }
};


const initLinearTask = () => {
  const equationText = qs('#equationText');
  const gcdLabel = qs('#gcdLabel');
  const userGcd = qs('#userGcd');
  const userCondition = qs('#userCondition');
  const userX0 = qs('#userX0');
  const userY0 = qs('#userY0');
  const linearTaskPanel = qs('#linearTaskPanel');
  const resultSection = qs('#resultSection');

  if (!equationText || !gcdLabel || !userGcd || !userCondition || !userX0 || !userY0) return;
  
  
  currentLinearTask = generateLinearTask(getLinearDifficulty());
  
  const eq = formatLinearEquationDisplay(
    currentLinearTask.a,
    currentLinearTask.b,
    currentLinearTask.c
  );
  equationText.textContent =
    `Дано рівняння ${eq}. Знайдіть часткові розв'язки рівняння за допомогою алгоритму Евкліда. Заповніть відповідні поля.`;

  let gcdTextNode = gcdLabel.firstChild;
  while (gcdTextNode && gcdTextNode.nodeType !== Node.TEXT_NODE) {
    gcdTextNode = gcdTextNode.nextSibling;
  }
  const absA = Math.abs(currentLinearTask.a);
  const absB = Math.abs(currentLinearTask.b);
  const gcdLabelText = `НСД(${absA}, ${absB}) = `;
  if (gcdTextNode) {
    gcdTextNode.textContent = gcdLabelText;
  } else {
    gcdLabel.insertBefore(document.createTextNode(gcdLabelText), gcdLabel.firstChild);
  }
  
  
  userGcd.value = '';
  userCondition.value = '';
  userX0.value = '';
  userY0.value = '';

  document.querySelectorAll('input[name="conditionHolds"]').forEach((r) => {
    r.checked = false;
  });
  syncLinearSolutionVisibility();

  
  updateConditionDisplay();
  
  
  if (linearTaskPanel) linearTaskPanel.style.display = '';
  if (resultSection) resultSection.style.display = 'none';
  const checkBtn = qs('#checkBtn');
  if (checkBtn) checkBtn.textContent = 'Перевірити';
};

const applyLinearHint = () => {
  if (!currentLinearTask) return;
  const userGcd = qs('#userGcd');
  const userCondition = qs('#userCondition');
  const userX0 = qs('#userX0');
  const userY0 = qs('#userY0');
  const checkBtn = qs('#checkBtn');
  if (!userGcd || !userCondition || !userX0 || !userY0 || !checkBtn) return;
  userGcd.value = String(currentLinearTask.gcd);
  userCondition.value = String(currentLinearTask.condition);
  const solvableHint = currentLinearTask.condition === 0;
  document.querySelectorAll('input[name="conditionHolds"]').forEach((r) => {
    r.checked = solvableHint ? r.value === 'yes' : r.value === 'no';
  });
  syncLinearSolutionVisibility();
  if (solvableHint) {
    userX0.value = String(currentLinearTask.x0);
    userY0.value = String(currentLinearTask.y0);
  } else {
    userX0.value = '';
    userY0.value = '';
  }
  updateConditionDisplay();
  checkBtn.textContent = 'Нове завдання';
};

const handleCheckOrRepeat = () => {
  const checkBtn = qs('#checkBtn');
  if (!checkBtn) return;
  if (checkBtn.textContent === 'Нове завдання') {
    
    initLinearTask();
    return;
  }
  checkLinearAnswers();
};


const parseLinearRequiredInt = (input) => {
  const raw = (input && input.value != null ? String(input.value) : '').trim();
  if (raw === '') return { value: NaN, wasEmpty: true, raw: '' };
  const n = Number(raw);
  return { value: Number.isFinite(n) ? n : NaN, wasEmpty: false, raw };
};


const parseLinearRootInput = (input) => {
  const raw = (input && input.value != null ? String(input.value) : '').trim();
  if (raw === '') return { value: 0, wasEmpty: true, raw };
  const n = Number(raw);
  return { value: Number.isFinite(n) ? n : NaN, wasEmpty: false, raw };
};

const escLinearHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');


const formatLinearUserNumberField = (num, inputEl) => {
  if (Number.isFinite(num)) return escLinearHtml(String(num));
  const raw = (inputEl && inputEl.value != null ? String(inputEl.value) : '').trim();
  if (raw === '') return '—';
  return escLinearHtml(raw);
};

const formatLinearRootUserDisplay = (parsed, val) => {
  if (parsed.wasEmpty) return '0';
  if (!Number.isFinite(val)) {
    if (!parsed.raw || parsed.raw.trim() === '') return '—';
    return escLinearHtml(parsed.raw.trim());
  }
  return escLinearHtml(String(val));
};


const linearCompareDataRow = (labelHtml, userOk, userTextPlain, correctTextPlain) => {
  const uIcon = userOk ? ICON_FB_OK : ICON_FB_FAIL;
  return `<div class="linear-result-compare-row">
    <div class="linear-result-compare-label">${labelHtml}</div>
    <div class="linear-result-compare-cell">
      <span class="linear-result-compare-val">${userTextPlain}</span>${uIcon}
    </div>
    <div class="linear-result-compare-cell">
      <span class="linear-result-compare-val">${correctTextPlain}</span>${ICON_FB_OK}
    </div>
  </div>`;
};

const linearCompareTable = (bodyRowsHtml) =>
  `<div class="linear-result-compare">
    <div class="linear-result-compare-row linear-result-compare-row--head">
      <div class="linear-result-compare-label"></div>
      <div class="linear-result-compare-cell linear-result-compare-head">Ваша відповідь</div>
      <div class="linear-result-compare-cell linear-result-compare-head">Правильна відповідь</div>
    </div>
    ${bodyRowsHtml}
  </div>`;


const checkLinearAnswers = () => {
  const userGcd = qs('#userGcd');
  const userCondition = qs('#userCondition');
  const userX0 = qs('#userX0');
  const userY0 = qs('#userY0');
  const resultContent = qs('#resultContent');
  const linearTaskPanel = qs('#linearTaskPanel');
  const resultSection = qs('#resultSection');
  const holdsRadio = document.querySelector('input[name="conditionHolds"]:checked');

  if (!currentLinearTask || !userGcd || !userCondition || !userX0 || !userY0 || !resultContent) return;

  const gcdParsed = parseLinearRequiredInt(userGcd);
  const condParsed = parseLinearRequiredInt(userCondition);
  const userGcdVal = gcdParsed.value;
  const userConditionVal = condParsed.value;
  const x0Parsed = parseLinearRootInput(userX0);
  const y0Parsed = parseLinearRootInput(userY0);
  const userX0Val = x0Parsed.value;
  const userY0Val = y0Parsed.value;
  const userHolds = holdsRadio ? holdsRadio.value : null;

  const solvable = currentLinearTask.condition === 0;
  const correctHoldsVal = solvable ? 'yes' : 'no';
  const holdsCorrect = userHolds === correctHoldsVal;

  const gcdCorrect = Number.isFinite(userGcdVal) && userGcdVal === currentLinearTask.gcd;
  const conditionCorrect =
    Number.isFinite(userConditionVal) && userConditionVal === currentLinearTask.condition;

  let x0Correct = false;
  let y0Correct = false;
  if (solvable && userHolds === 'yes') {
    x0Correct = Number.isFinite(userX0Val) && userX0Val === currentLinearTask.x0;
    y0Correct = Number.isFinite(userY0Val) && userY0Val === currentLinearTask.y0;
  } else if (!solvable && userHolds === 'no') {
    x0Correct = true;
    y0Correct = true;
  }

  const maxScore = 12;

  linearScore = 0;
  if (solvable) {
    
    if (gcdCorrect) linearScore += 2;
    if (conditionCorrect) linearScore += 2;
    if (holdsCorrect) linearScore += 2;
    if (userHolds === 'yes') {
      if (x0Correct) linearScore += 3;
      if (y0Correct) linearScore += 3;
    }
  } else {
    
    if (gcdCorrect) linearScore += 4;
    if (conditionCorrect) linearScore += 4;
    if (holdsCorrect) linearScore += 4;
  }

  const holdsWord = (v) => (v === 'yes' ? 'Так' : v === 'no' ? 'Ні' : '—');
  const userHoldsWord = holdsWord(userHolds);
  const correctHoldsWord = holdsWord(correctHoldsVal);

  const absA = Math.abs(currentLinearTask.a);
  const absB = Math.abs(currentLinearTask.b);
  const cVal = currentLinearTask.c;
  const modLabelPart = Number.isFinite(userGcdVal) ? userGcdVal : '—';

  let compareRows = '';
  compareRows += linearCompareDataRow(
    `НСД(${absA}, ${absB})`,
    gcdCorrect,
    formatLinearUserNumberField(userGcdVal, userGcd),
    escLinearHtml(String(currentLinearTask.gcd))
  );
  compareRows += linearCompareDataRow(
    `Остача від ділення (${cVal} mod ${modLabelPart})`,
    conditionCorrect,
    formatLinearUserNumberField(userConditionVal, userCondition),
    escLinearHtml(String(currentLinearTask.condition))
  );
  compareRows += linearCompareDataRow(
    'Умова існування виконується?',
    holdsCorrect,
    escLinearHtml(userHoldsWord),
    escLinearHtml(correctHoldsWord)
  );
  
  if (solvable) {
    const showUserRoots = userHolds === 'yes';
    compareRows += linearCompareDataRow(
      `Частковий розв'язок x<span class="sub-idx">p</span>`,
      showUserRoots ? x0Correct : false,
      showUserRoots ? formatLinearRootUserDisplay(x0Parsed, userX0Val) : '—',
      escLinearHtml(String(currentLinearTask.x0))
    );
    compareRows += linearCompareDataRow(
      `Частковий розв'язок y<span class="sub-idx">p</span>`,
      showUserRoots ? y0Correct : false,
      showUserRoots ? formatLinearRootUserDisplay(y0Parsed, userY0Val) : '—',
      escLinearHtml(String(currentLinearTask.y0))
    );
  }

  let resultHTML = '<div style="margin-bottom: 12px;"><strong>Результати перевірки:</strong></div>';
  resultHTML += linearCompareTable(compareRows);

  resultHTML += `<div class="score-result-block">
    Оцінка: ${linearScore} / ${maxScore}
  </div>`;

  resultContent.innerHTML = resultHTML;
  
  
  if (linearTaskPanel) linearTaskPanel.style.display = 'none';
  resultSection.style.display = 'block';
  
  const newTaskBtn = qs('#newTaskBtn');
  if (newTaskBtn) {
    newTaskBtn.style.display = 'block';
    newTaskBtn.textContent = 'Нове завдання';
  }
};


const checkBtn = qs('#checkBtn');
const hintBtn = qs('#hintBtn');
const newTaskBtn = qs('#newTaskBtn');
const userGcd = qs('#userGcd');

if (checkBtn) {
  checkBtn.addEventListener('click', handleCheckOrRepeat);
}

if (hintBtn) {
  hintBtn.addEventListener('click', applyLinearHint);
}

if (newTaskBtn) {
  newTaskBtn.addEventListener('click', () => {
    initLinearTask();
  });
}


if (userGcd) {
  userGcd.addEventListener('input', updateConditionDisplay);
}

document.querySelectorAll('input[name="conditionHolds"]').forEach((input) => {
  input.addEventListener('change', syncLinearSolutionVisibility);
});

document.querySelectorAll('input[name="linearDifficulty"]').forEach((input) => {
  input.addEventListener('change', () => initLinearTask());
});


if (qs('#equationText')) {
  initLinearTask();
}



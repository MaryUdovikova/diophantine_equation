

let textProblemTask = null;
let textProblemHintUsed = false;
let textProblemCheckActsAsNewTask = false;

const textProblemFieldLabels = {
  0: { x: 'Продано порцій сиру =', y: 'Куплено яєць =' },
  1: { x: 'Кількість монстрів =', y: 'Куплено скринь =' },
  2: { x: 'Кількість влучань =', y: 'Куплено порцій вати =' }
};

const getTextProblemDifficulty = () => {
  const checked = document.querySelector('input[name="textProblemsDifficulty"]:checked');
  return checked ? checked.value : 'medium';
};

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const textProblemGcd = (a, b) => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
};

const formatStory = (templateId, a, b, c) => {
  const commonTail = ' (Знайдіть частковий розв’язок).';
  if (templateId === 0) {
    return `Фермер продає на ярмарку домашній сир порціями, заробляючи по ${a} гривень за кожну. Одночасно він купує у сусідньому наметі яйця, які коштують по ${b} гривень за штуку. Зранку в нього не було готівки. Коли ярмарок закрився, фермер підрахував гроші і побачив, що у нього залишилося рівно ${c} гривні. Скільки порцій сиру міг продати і скільки яєць купити фермер за день?${commonTail}`;
  }
  if (templateId === 1) {
    return `У комп’ютерній грі за кожного переможеного монстра гравець отримує ${a} золотих монет. У магазині гравець може купити скриню з магічними предметами за ${b} монет. Гравець почав грати з порожнім інвентарем. Після кількох годин гри він побачив, що в нього на балансі залишилося рівно ${c} монет. Скільки монстрів переміг гравець і скільки разів він купив скрині?${commonTail}`;
  }
  return `Оленка грає в тир у парку розваг. За кожне влучання автомат видає їй ${a} призових квитків. Поруч стоїть апарат із солодкою ватою, і кожна порція вати коштує ${b} квитків. Коли Оленка зібралась додому, в неї залишилося рівно ${c} невикористані квитки. Скільки разів вона влучно вистрілила в тирі і скільки порцій солодкої вати купила?${commonTail}`;
};

const generateTextProblemTask = (difficulty) => {
  const cfg = {
    easy: { coefMin: 3, coefMax: 9, valMin: 1, valMax: 8, cMax: 12 },
    medium: { coefMin: 8, coefMax: 20, valMin: 2, valMax: 16, cMax: 24 },
    hard: { coefMin: 15, coefMax: 40, valMin: 4, valMax: 30, cMax: 50 }
  }[difficulty] || { coefMin: 8, coefMax: 20, valMin: 2, valMax: 16, cMax: 24 };

  for (let attempt = 0; attempt < 300; attempt += 1) {
    const a = randInt(cfg.coefMin, cfg.coefMax);
    const b = randInt(cfg.coefMin, cfg.coefMax);
    if (a === b) continue;

    const x0 = randInt(cfg.valMin, cfg.valMax);
    const y0 = randInt(cfg.valMin, cfg.valMax);
    const c = a * x0 - b * y0;
    if (c <= 0 || c > cfg.cMax) continue;
    if (c % textProblemGcd(a, b) !== 0) continue;

    const templateId = randInt(0, 2);
    return {
      a,
      b,
      c,
      x0,
      y0,
      templateId,
      equation: `${a}x - ${b}y = ${c}`,
      story: formatStory(templateId, a, b, c)
    };
  }

  
  return {
    a: 5,
    b: 7,
    c: 3,
    x0: 2,
    y0: 1,
    templateId: 0,
    equation: '5x - 7y = 3',
    story: formatStory(0, 5, 7, 3)
  };
};

const renderTextProblemTask = () => {
  const story = qs('#textProblemStory');
  const inputSection = qs('#textProblemInputSection');
  const resultSection = qs('#resultSection');
  const resultContent = qs('#textProblemResultContent');
  const xInput = qs('#textProblemXp');
  const yInput = qs('#textProblemYp');
  const checkBtn = qs('#textProblemCheckBtn');
  const hintBtn = qs('#textProblemHintBtn');

  if (!story || !xInput || !yInput || !inputSection || !resultSection || !resultContent) return;

  textProblemTask = generateTextProblemTask(getTextProblemDifficulty());
  textProblemHintUsed = false;
  textProblemCheckActsAsNewTask = false;

  story.textContent = textProblemTask.story;
  setTextProblemFieldLabels(textProblemTask.templateId);
  xInput.value = '';
  yInput.value = '';
  xInput.disabled = false;
  yInput.disabled = false;
  if (checkBtn) checkBtn.disabled = false;
  if (hintBtn) hintBtn.disabled = false;
  if (checkBtn) checkBtn.textContent = 'Перевірити';
  setTextProblemInlineMessage('');

  resultContent.innerHTML = '';
  inputSection.style.display = 'block';
  resultSection.style.display = 'none';
};

const showTextProblemResult = (html) => {
  const inputSection = qs('#textProblemInputSection');
  const resultSection = qs('#resultSection');
  const resultContent = qs('#textProblemResultContent');
  if (!resultContent || !inputSection || !resultSection) return;
  resultContent.innerHTML = html;
  inputSection.style.display = 'none';
  resultSection.style.display = 'block';
};

const setTextProblemInlineMessage = (html) => {
  const box = qs('#textProblemInlineMessage');
  if (!box) return;
  box.innerHTML = html;
};

const setTextProblemFieldLabels = (templateId) => {
  const xLabel = qs('#textProblemXLabel');
  const yLabel = qs('#textProblemYLabel');
  const xInput = qs('#textProblemXp');
  const yInput = qs('#textProblemYp');
  if (!xLabel || !yLabel || !xInput || !yInput) return;

  const labels = textProblemFieldLabels[templateId] || { x: 'xₚ =', y: 'yₚ =' };
  xLabel.textContent = labels.x;
  yLabel.textContent = labels.y;
  xInput.setAttribute('aria-label', labels.x.replace(/\s*=\s*$/, ''));
  yInput.setAttribute('aria-label', labels.y.replace(/\s*=\s*$/, ''));
};

const checkTextProblem = () => {
  if (!textProblemTask) return;
  const xInput = qs('#textProblemXp');
  const yInput = qs('#textProblemYp');
  if (!xInput || !yInput) return;

  const xRaw = xInput.value.trim();
  const yRaw = yInput.value.trim();
  if (xRaw === '' || yRaw === '') {
    setTextProblemInlineMessage(
      `<div style="color:#ef4444;">${ICON_FB_FAIL} Введіть два цілих числа.</div>`
    );
    return;
  }

  const x = Number(xRaw);
  const y = Number(yRaw);
  if (!Number.isInteger(x) || !Number.isInteger(y)) {
    setTextProblemInlineMessage(
      `<div style="color:#ef4444;">${ICON_FB_FAIL} Введіть два цілих числа.</div>`
    );
    return;
  }
  setTextProblemInlineMessage('');

  const { a, b, c } = textProblemTask;
  const lhs = a * x - b * y;
  const isNonNegative = x >= 0 && y >= 0;
  const isCorrect = lhs === c && isNonNegative;

  if (isCorrect) {
    showTextProblemResult(
      `<div style="color:#10b981;"><strong>Правильно!</strong></div>
       <div style="margin-top:8px;">Перевірка: ${a}·${x} - ${b}·${y} = ${lhs}.</div>
       <div style="margin-top:8px;">Частковий розв’язок: xₚ = ${x}, yₚ = ${y}.</div>`
    );
  } else {
    const reason = !isNonNegative
      ? 'У контексті задачі кількість дій/покупок не може бути від’ємною.'
      : `${a}·${x} - ${b}·${y} = ${lhs}, потрібно ${c}.`;
    showTextProblemResult(
      `<div style="color:#ef4444;">${ICON_FB_FAIL} Ваша відповідь: ${reason}</div>`
    );
  }
};

const showTextProblemHint = () => {
  if (!textProblemTask || textProblemHintUsed) return;
  textProblemHintUsed = true;
  const { x0, y0 } = textProblemTask;
  const xInput = qs('#textProblemXp');
  const yInput = qs('#textProblemYp');
  const checkBtn = qs('#textProblemCheckBtn');
  if (!xInput || !yInput || !checkBtn) return;

  
  xInput.value = String(x0);
  yInput.value = String(y0);
  textProblemCheckActsAsNewTask = true;
  checkBtn.textContent = 'Нове завдання';
};

const textProblemCheckBtn = qs('#textProblemCheckBtn');
const textProblemHintBtn = qs('#textProblemHintBtn');
const textProblemNewTaskBtn = qs('#textProblemNewTaskBtn');

if (qs('#textProblemStory') && textProblemCheckBtn && textProblemHintBtn && textProblemNewTaskBtn) {
  textProblemCheckBtn.addEventListener('click', () => {
    if (textProblemCheckActsAsNewTask) {
      renderTextProblemTask();
      return;
    }
    checkTextProblem();
  });
  textProblemHintBtn.addEventListener('click', showTextProblemHint);
  textProblemNewTaskBtn.addEventListener('click', renderTextProblemTask);
  document.querySelectorAll('input[name="textProblemsDifficulty"]').forEach((r) => {
    r.addEventListener('change', renderTextProblemTask);
  });

  renderTextProblemTask();
}


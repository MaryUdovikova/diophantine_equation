


const coinsStatus = qs('#coinsStatus');
const coinsGrid = qs('#coinsGrid');
const scoreElement = qs('#score');
const coinsIntro = qs('#coinsIntro');
const coinsGamePanel = qs('#coinsGamePanel');
const coinsEquationText = qs('#coinsEquationText');
const startGameBtn = qs('#startGame');
const checkSection = qs('#checkSection');
const coinsHintBtn = qs('#coinsHintBtn');
const coinsHintLine = qs('#coinsHintLine');
const coinsDifficultyFieldset = qs('#coinsDifficultyFieldset');

let gameState = {
  score: 0,
  reachable: [],
  limit: 0,
  p: 0,
  q: 0,
  selected: new Set(), 
  checked: new Set(), 
  gameStarted: false,
  hintRevealed: false
};

const coinPInput = qs('#coinP');
const coinQInput = qs('#coinQ');
const coinLimitInput = qs('#coinLimit');

const getCoinsDifficulty = () => {
  const r = document.querySelector('input[name="coinsDifficulty"]:checked');
  return r ? r.value : 'medium';
};


const generateCoinDenominations = (difficulty) => {
  const level = difficulty || getCoinsDifficulty();
  let p;
  let q;
  let guard = 0;
  do {
    switch (level) {
      case 'easy':
        p = Math.floor(Math.random() * 3) + 3; 
        q = Math.floor(Math.random() * 4) + 6; 
        break;
      case 'hard':
        p = Math.floor(Math.random() * 7) + 6; 
        q = Math.floor(Math.random() * 9) + 10; 
        break;
      case 'medium':
      default:
        p = Math.floor(Math.random() * 4) + 4; 
        q = Math.floor(Math.random() * 7) + 8; 
        break;
    }
    guard += 1;
  } while (p === q && guard < 64);
  if (p === q) {
    q = p === 18 ? p - 1 : p + 1;
  }
  return { p, q };
};


const calculateMaxSum = (p, q, difficulty) => {
  const level = difficulty || getCoinsDifficulty();
  const caps = { easy: 40, medium: 60, hard: 85 };
  const cap = caps[level] ?? caps.medium;
  const g = gcd(p, q);
  if (g !== 1) {
    return Math.min(50, cap);
  }
  const frobenius = p * q - p - q;
  const extra = level === 'easy' ? 8 : level === 'hard' ? 12 : 10;
  return Math.min(frobenius + extra, cap);
};


const updateCoinsEquationText = () => {
  if (!coinsEquationText || !coinPInput || !coinQInput || !coinLimitInput) return;
  const p = Math.floor(Number(coinPInput.value));
  const q = Math.floor(Number(coinQInput.value));
  const limit = Math.floor(Number(coinLimitInput.value));
  if ([p, q, limit].some((n) => Number.isNaN(n) || n < 1)) return;
  coinsEquationText.textContent =
    `Ви маєте монети з номіналами p = ${p} та q = ${q}. Після початку гри із переліку всіх наданих чисел виберіть ті які НЕ можна утворити за допомогою цих монет (недосяжні суми). Вони стануть жовтими. Натисніть кнопку "Перевірити". Зеленим відображатимуться правильні відповіді, помаранчевим - пропущені, червоним - неправильні. Суми які можна утворити (досяжні суми), можна знайти за формулою u = ${p}x + ${q}y (де x, y - невід'ємні цілі).`;
};

const initializeCoins = () => {
  if (!coinPInput || !coinQInput || !coinLimitInput) return;
  const d = getCoinsDifficulty();
  const { p, q } = generateCoinDenominations(d);
  coinPInput.value = p;
  coinQInput.value = q;
  coinLimitInput.value = calculateMaxSum(p, q, d);
  updateCoinsEquationText();
};

const calculateReachable = (p, q, limit) => {
  const reachable = Array(limit + 1).fill(false);
  reachable[0] = true;
  for (let i = 0; i <= limit; i += 1) {
    if (!reachable[i]) continue;
    if (i + p <= limit) reachable[i + p] = true;
    if (i + q <= limit) reachable[i + q] = true;
  }
  return reachable;
};


const resetCoinsToIntro = () => {
  if (coinsIntro) coinsIntro.style.display = '';
  if (coinsGamePanel) coinsGamePanel.style.display = 'none';
  if (coinsGrid) coinsGrid.innerHTML = '';
  if (coinsStatus) coinsStatus.textContent = '';
  if (coinsHintLine) {
    coinsHintLine.textContent = '';
    coinsHintLine.hidden = true;
  }
  if (checkSection) checkSection.style.display = 'none';
  if (scoreElement) scoreElement.textContent = '0 / 12';
  const checkAnswersBtnReset = qs('#checkAnswers');
  if (checkAnswersBtnReset) checkAnswersBtnReset.disabled = false;
  if (coinsHintBtn) coinsHintBtn.disabled = false;
  if (startGameBtn) {
    startGameBtn.textContent = 'Почати гру';
    const startFooter = startGameBtn.closest('.linear-task-footer');
    if (startFooter) startFooter.style.display = '';
  }
  if (coinsDifficultyFieldset) coinsDifficultyFieldset.style.display = '';
  gameState = {
    score: 0,
    reachable: [],
    limit: 0,
    p: 0,
    q: 0,
    selected: new Set(),
    checked: new Set(),
    gameStarted: false,
    hintRevealed: false
  };
  initializeCoins();
};

const onStartGameClick = () => {
  if (startGameBtn && startGameBtn.textContent.trim() === 'Нова гра') {
    resetCoinsToIntro();
    return;
  }
  startGame();
};

const startGame = () => {
  if (!coinsStatus || !coinsGrid || !coinPInput || !coinQInput || !coinLimitInput) return;

  const p = Math.floor(Number(coinPInput.value));
  const q = Math.floor(Number(coinQInput.value));
  const limit = Math.floor(Number(coinLimitInput.value));
  if ([p, q, limit].some((n) => Number.isNaN(n) || n < 1)) {
    coinsStatus.textContent = 'Введіть коректні додатні цілі числа для p, q та максимальної суми.';
    return;
  }

  if (coinsIntro) coinsIntro.style.display = 'none';
  if (coinsGamePanel) coinsGamePanel.style.display = 'block';

  
  gameState = {
    score: 0,
    reachable: [],
    limit: 0,
    p: 0,
    q: 0,
    selected: new Set(),
    checked: new Set(),
    gameStarted: false,
    hintRevealed: false
  };

  const checkAnswersBtnReset = qs('#checkAnswers');
  if (checkAnswersBtnReset) checkAnswersBtnReset.disabled = false;
  if (coinsHintBtn) coinsHintBtn.disabled = false;
  if (startGameBtn) startGameBtn.textContent = 'Почати гру';
  
  if (scoreElement) scoreElement.textContent = '0 / 12';
  if (coinsGrid) coinsGrid.innerHTML = '';
  if (coinsStatus) coinsStatus.textContent = '';
  if (coinsHintLine) {
    coinsHintLine.textContent = '';
    coinsHintLine.hidden = true;
  }
  if (checkSection) checkSection.style.display = 'none';
  updateCoinsEquationText();

  const reachable = calculateReachable(p, q, limit);

  gameState = {
    score: 0,
    reachable,
    limit,
    p,
    q,
    selected: new Set(),
    checked: new Set(),
    gameStarted: true,
    hintRevealed: false
  };

  if (scoreElement) scoreElement.textContent = '0 / 12';

  
  if (checkSection) checkSection.style.display = 'block';

  const badges = [];
  for (let s = 1; s <= limit; s += 1) {
    badges.push(`<button class="badge badge-game" data-sum="${s}" aria-label="Сума ${s}">${s}</button>`);
  }
  coinsGrid.innerHTML = badges.join('');

  
  const badgeButtons = coinsGrid.querySelectorAll('.badge-game');
  badgeButtons.forEach((btn) => {
    btn.addEventListener('click', () => handleSumClick(Number(btn.dataset.sum)));
  });

  const startFooterHide = startGameBtn && startGameBtn.closest('.linear-task-footer');
  if (startFooterHide) startFooterHide.style.display = 'none';
  if (coinsDifficultyFieldset) coinsDifficultyFieldset.style.display = 'none';
};


const hasUncheckedButtons = () => {
  return Array.from({ length: gameState.limit }, (_, i) => i + 1)
    .some(s => !gameState.checked.has(s));
};


const updateCheckButtonVisibility = () => {
  if (checkSection) {
    checkSection.style.display = (gameState.selected.size > 0 || hasUncheckedButtons()) ? 'block' : 'none';
  }
};

const lockSumButtons = () => {
  if (!coinsGrid) return;
  coinsGrid.querySelectorAll('button[data-sum]').forEach((btn) => {
    btn.disabled = true;
  });
};


const showRepeatGameButton = () => {
  if (startGameBtn) {
    startGameBtn.textContent = 'Нова гра';
    const startFooter = startGameBtn.closest('.linear-task-footer');
    if (startFooter) startFooter.style.display = '';
  }
  const checkAnswersBtnDone = qs('#checkAnswers');
  if (checkAnswersBtnDone) checkAnswersBtnDone.disabled = true;
  if (coinsHintBtn) coinsHintBtn.disabled = true;
};

const applyCoinsHint = () => {
  if (!gameState.gameStarted || gameState.hintRevealed || !coinsGrid) return;
  const { p, q, reachable, limit } = gameState;
  if (!p || !q || !coinsHintLine) return;

  const unreachable = [];
  for (let s = 1; s <= limit; s += 1) {
    if (!reachable[s]) unreachable.push(s);
  }

  const g = gcd(p, q);
  let hintText;
  if (g !== 1) {
    hintText = `Підказка: НСД(${p}, ${q}) = ${g}. Оскільки НСД ≠ 1, недосяжні всі суми, що не кратні ${g}.`;
  } else {
    const pq = p * q;
    const f = pq - p - q;
    hintText = `Підказка: НСД(${p}, ${q}) = 1. Число Фробеніуса g(${p}, ${q}) = ${p}·${q} − ${p} − ${q} = ${pq} − ${p} − ${q} = ${f}.`;
  }
  coinsHintLine.textContent = hintText;
  coinsHintLine.hidden = false;

  gameState.selected = new Set(unreachable);
  for (let s = 1; s <= limit; s += 1) {
    const button = coinsGrid.querySelector(`[data-sum="${s}"]`);
    if (!button) continue;
    const isUn = !reachable[s];
    button.classList.remove('badge-selected', 'badge-game', 'badge-incorrect', 'badge-missed');
    if (isUn) {
      button.classList.add('badge-correct');
    } else {
      button.classList.add('badge-game');
    }
  }

  gameState.hintRevealed = true;
  lockSumButtons();
  showRepeatGameButton();
};

const handleSumClick = (sum) => {
  if (!gameState.gameStarted || gameState.hintRevealed || gameState.checked.has(sum)) return;

  const button = coinsGrid.querySelector(`[data-sum="${sum}"]`);
  if (!button) return;

  
  if (gameState.selected.has(sum)) {
    
    gameState.selected.delete(sum);
    button.classList.remove('badge-selected');
    button.classList.add('badge-game');
  } else {
    
    gameState.selected.add(sum);
    button.classList.remove('badge-game');
    button.classList.add('badge-selected');
  }

  
  updateCheckButtonVisibility();
};

const checkAnswers = () => {
  if (!gameState.gameStarted || gameState.hintRevealed) return;

  
  const allUnreachable = [];
  for (let s = 1; s <= gameState.limit; s += 1) {
    if (!gameState.reachable[s]) {
      allUnreachable.push(s);
    }
  }

  const totalUnreachable = allUnreachable.length;
  if (totalUnreachable === 0) {
    
    if (scoreElement) {
      scoreElement.textContent = '0 / 12';
    }
    gameState.score = 0;
    lockSumButtons();
    showRepeatGameButton();
    return;
  }

  let scoreChange = 0;

  
  
  const selectedCopy = new Set(gameState.selected);
  selectedCopy.forEach((sum) => {
    
    if (gameState.checked.has(sum)) return;
    
    const isUnreachable = !gameState.reachable[sum];
    const button = coinsGrid.querySelector(`[data-sum="${sum}"]`);
    if (!button) return;

    
    gameState.checked.add(sum);
    gameState.selected.delete(sum);

    if (isUnreachable) {
      
      button.classList.remove('badge-selected');
      button.classList.add('badge-correct');
      scoreChange += 1;
    } else {
      
      button.classList.remove('badge-selected');
      button.classList.add('badge-incorrect');
      scoreChange -= 1;
    }
  });

  
  
  for (let s = 1; s <= gameState.limit; s += 1) {
    const isUnreachable = !gameState.reachable[s];
    
    if (isUnreachable && !gameState.checked.has(s)) {
      
      const button = coinsGrid.querySelector(`[data-sum="${s}"]`);
      if (button && !button.classList.contains('badge-missed')) {
        button.classList.remove('badge-game', 'badge-selected');
        button.classList.add('badge-missed');
        gameState.checked.add(s);
        
      }
    }
  }

  
  gameState.score = Math.max(0, gameState.score + scoreChange);

  
  if (scoreElement) {
    const raw = gameState.score;
    const maxRaw = totalUnreachable;
    const grade12 =
      maxRaw > 0 ? Math.max(0, Math.min(12, Math.round((raw / maxRaw) * 12))) : 0;
    scoreElement.textContent = `${grade12} / 12`;
  }

  lockSumButtons();
  showRepeatGameButton();

  
  updateCheckButtonVisibility();
};

if (startGameBtn) {
  startGameBtn.addEventListener('click', onStartGameClick);
}

const checkAnswersBtn = qs('#checkAnswers');
if (checkAnswersBtn) {
  checkAnswersBtn.addEventListener('click', checkAnswers);
}
if (coinsHintBtn) {
  coinsHintBtn.addEventListener('click', applyCoinsHint);
}


const isCoinsPlayFinished = () =>
  Boolean(startGameBtn && startGameBtn.textContent.trim() === 'Нова гра');

document.querySelectorAll('input[name="coinsDifficulty"]').forEach((input) => {
  input.addEventListener('change', () => {
    if (isCoinsPlayFinished()) {
      initializeCoins();
      return;
    }
    const wasActive = gameState.gameStarted && coinsGrid && coinsGrid.children.length > 0;
    initializeCoins();
    if (wasActive) {
      startGame();
    }
  });
});

initializeCoins();


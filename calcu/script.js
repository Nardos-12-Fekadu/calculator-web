const resultEl = document.getElementById('result');
const exprEl = document.getElementById('expression');

let current = '0';
let previous = null;
let operator = null;
let overwrite = true;

const opSymbols = { add: '+', subtract: '\u2212', multiply: '\u00d7', divide: '\u00f7' };

function formatNum(n) {
  if (n === '' || n === '-') return n;
  const num = parseFloat(n);
  if (Number.isNaN(num)) return '0';
  if (Math.abs(num) > 999999999999) return num.toExponential(4);
  let str = n.toString();
  if (str.length > 14) str = num.toPrecision(12).toString();
  return str;
}

function updateScreen() {
  resultEl.textContent = formatNum(current);
  if (operator && previous !== null) {
    exprEl.textContent = `${formatNum(previous)} ${opSymbols[operator]}`;
  } else {
    exprEl.textContent = '\u00a0';
  }
  document.querySelectorAll('.op[data-action]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.action === operator);
  });
}

function inputNum(d) {
  if (overwrite) {
    current = d === '.' ? '0.' : d;
    overwrite = false;
  } else {
    if (d === '.' && current.includes('.')) return;
    if (current === '0' && d !== '.') current = d;
    else current += d;
  }
  updateScreen();
}

function compute(a, b, op) {
  a = parseFloat(a); b = parseFloat(b);
  switch (op) {
    case 'add': return a + b;
    case 'subtract': return a - b;
    case 'multiply': return a * b;
    case 'divide': return b === 0 ? NaN : a / b;
    default: return b;
  }
}

function chooseOperator(op) {
  if (operator && !overwrite) {
    current = String(compute(previous, current, operator));
  }
  previous = current;
  operator = op;
  overwrite = true;
  updateScreen();
}

function equals() {
  if (operator === null) return;
  current = String(compute(previous, current, operator));
  operator = null;
  previous = null;
  overwrite = true;
  updateScreen();
}

function clearAll() {
  current = '0';
  previous = null;
  operator = null;
  overwrite = true;
  updateScreen();
}

function toggleSign() {
  if (current === '0') return;
  current = current.startsWith('-') ? current.slice(1) : '-' + current;
  updateScreen();
}

// Turns the current number into a percentage.
// If there's a pending operator, it takes the percent relative to
// the previous value (e.g. 200 + 10% = 220), like a physical calculator.
function percent() {
  const value = parseFloat(current);
  if (Number.isNaN(value)) return;
  if (operator && previous !== null) {
    const base = parseFloat(previous);
    current = String((base * value) / 100);
  } else {
    current = String(value / 100);
  }
  overwrite = true;
  updateScreen();
}

document.querySelectorAll('[data-num]').forEach(btn => {
  btn.addEventListener('click', () => {
    const d = btn.dataset.num !== undefined ? btn.dataset.num : '.';
    inputNum(d);
  });
});

document.querySelector('[data-action="decimal"]').addEventListener('click', () => inputNum('.'));
document.querySelector('[data-action="clear"]').addEventListener('click', clearAll);
document.querySelector('[data-action="sign"]').addEventListener('click', toggleSign);
document.querySelector('[data-action="equals"]').addEventListener('click', equals);
document.querySelector('[data-action="percent"]').addEventListener('click', percent);
['add', 'subtract', 'multiply', 'divide'].forEach(op => {
  document.querySelector(`[data-action="${op}"]`).addEventListener('click', () => chooseOperator(op));
});

window.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') inputNum(e.key);
  else if (e.key === '.') inputNum('.');
  else if (e.key === '+') chooseOperator('add');
  else if (e.key === '-') chooseOperator('subtract');
  else if (e.key === '*') chooseOperator('multiply');
  else if (e.key === '/') { e.preventDefault(); chooseOperator('divide'); }
  else if (e.key === '%') percent();
  else if (e.key === 'Enter' || e.key === '=') equals();
  else if (e.key === 'Escape') clearAll();
  else if (e.key === 'Backspace') {
    current = current.length > 1 ? current.slice(0, -1) : '0';
    overwrite = current === '0';
    updateScreen();
  }
});

updateScreen();
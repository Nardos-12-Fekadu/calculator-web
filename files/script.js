// ----- Elements -----
const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const categoryInput = document.getElementById('category-input');
const categorySuggestions = document.getElementById('category-suggestions');
const priorityInput = document.getElementById('priority-input');
const dueInput = document.getElementById('due-input');
const list = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const taskCount = document.getElementById('task-count');
const clearDoneButton = document.getElementById('clear-done');
const searchInput = document.getElementById('search-input');
const filterSelect = document.getElementById('filter-select');
const themeToggle = document.getElementById('theme-toggle');
const progressFill = document.getElementById('progress-fill');
const progressLabel = document.getElementById('progress-label');
const confettiLayer = document.getElementById('confetti-layer');

// ----- Storage keys -----
const STORAGE_KEY = 'bloom-tasks';
const THEME_KEY = 'bloom-theme';

// ----- State -----
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let searchTerm = '';
let filterMode = 'all'; // 'all' | 'open' | 'done'
let draggedId = null;

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ----- Due date helpers -----
function isOverdue(dateString, done) {
  if (!dateString || done) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateString + 'T00:00:00') < today;
}

function formatDate(dateString) {
  if (!dateString) return '';
  const due = new Date(dateString + 'T00:00:00');
  return due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ----- Category suggestions (built from tasks already used) -----
function refreshCategorySuggestions() {
  const categories = [...new Set(tasks.map((t) => t.category).filter(Boolean))];
  categorySuggestions.innerHTML = '';
  categories.forEach((cat) => {
    const option = document.createElement('option');
    option.value = cat;
    categorySuggestions.appendChild(option);
  });
}

// ----- Filtering -----
function getVisibleTasks() {
  return tasks.filter((task) => {
    const haystack = (task.text + ' ' + (task.category || '')).toLowerCase();
    const matchesSearch = haystack.includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterMode === 'all' ||
      (filterMode === 'open' && !task.done) ||
      (filterMode === 'done' && task.done);
    return matchesSearch && matchesFilter;
  });
}

// ----- Progress bar -----
function updateProgress() {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  progressFill.style.width = pct + '%';
  progressLabel.textContent = `${done} of ${total} done`;
}

// ----- Confetti burst near a given element -----
function launchConfetti(originEl) {
  const colors = ['#c23a72', '#d9578b', '#f0a8c4', '#d9a441', '#5f9b7c'];
  const rect = originEl.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  for (let i = 0; i < 14; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 50;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 20;
    piece.style.setProperty('--dx', `${dx}px`);
    piece.style.setProperty('--dy', `${dy}px`);
    piece.style.setProperty('--rot', `${Math.random() * 360}deg`);
    piece.style.left = `${originX}px`;
    piece.style.top = `${originY}px`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    confettiLayer.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }
}

// ----- Render -----
function renderTasks() {
  list.innerHTML = '';
  const visibleTasks = getVisibleTasks();

  visibleTasks.forEach((task) => {
    const item = document.createElement('li');
    item.className = 'task-item' + (task.done ? ' task-item--done' : '');
    item.draggable = true;
    item.dataset.id = task.id;

    item.addEventListener('dragstart', () => {
      draggedId = task.id;
      item.classList.add('dragging');
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
    });
    item.addEventListener('dragover', (e) => e.preventDefault());
    item.addEventListener('drop', () => reorderTasks(draggedId, task.id));

    // Drag handle
    const handle = document.createElement('span');
    handle.className = 'task-item__handle';
    handle.textContent = '⠿';
    handle.setAttribute('aria-hidden', 'true');

    // Checkbox
    const check = document.createElement('button');
    check.className = 'task-item__check';
    check.setAttribute('aria-label', task.done ? 'Mark as not done' : 'Mark as done');
    check.addEventListener('click', () => toggleTask(task.id, check));

    // Body
    const body = document.createElement('div');
    body.className = 'task-item__body';

    const top = document.createElement('div');
    top.className = 'task-item__top';

    const dot = document.createElement('span');
    dot.className = `priority-dot priority-dot--${task.priority || 'medium'}`;
    dot.title = `${task.priority || 'medium'} priority`;

    const text = document.createElement('span');
    text.className = 'task-item__text';
    text.textContent = task.text;
    text.title = 'Click to edit';
    text.addEventListener('click', () => startEditing(task.id, body));

    top.appendChild(dot);
    top.appendChild(text);
    body.appendChild(top);

    // Meta row: category pill + due date
    if (task.category || task.due) {
      const metaRow = document.createElement('div');
      metaRow.className = 'task-item__meta-row';

      if (task.category) {
        const pill = document.createElement('span');
        pill.className = 'category-pill';
        pill.textContent = task.category;
        metaRow.appendChild(pill);
      }

      if (task.due) {
        const overdue = isOverdue(task.due, task.done);
        const due = document.createElement('span');
        due.className = 'task-item__due' + (overdue ? ' task-item__due--overdue' : '');
        due.textContent = overdue ? `Overdue — ${formatDate(task.due)}` : `Due ${formatDate(task.due)}`;
        metaRow.appendChild(due);
      }

      body.appendChild(metaRow);
    }

    // Actions
    const actions = document.createElement('div');
    actions.className = 'task-item__actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'task-item__edit';
    editBtn.textContent = 'edit';
    editBtn.setAttribute('aria-label', `Edit "${task.text}"`);
    editBtn.addEventListener('click', () => startEditing(task.id, body));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-item__delete';
    deleteBtn.textContent = 'remove';
    deleteBtn.setAttribute('aria-label', `Remove "${task.text}"`);
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    item.appendChild(handle);
    item.appendChild(check);
    item.appendChild(body);
    item.appendChild(actions);
    list.appendChild(item);
  });

  if (tasks.length === 0) {
    emptyState.textContent = 'Nothing here yet — add your first task above.';
    emptyState.style.display = 'block';
  } else if (visibleTasks.length === 0) {
    emptyState.textContent = 'No tasks match your search or filter.';
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
  }

  const openCount = tasks.filter((task) => !task.done).length;
  taskCount.textContent = `${openCount} open`;
  updateProgress();
  refreshCategorySuggestions();
}

// ----- Inline editing -----
function startEditing(id, body) {
  const task = tasks.find((t) => t.id === id);
  if (!task || body.querySelector('.task-item__text-input')) return;

  const top = body.querySelector('.task-item__top');
  const textEl = top.querySelector('.task-item__text');

  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'task-item__text-input';
  editInput.value = task.text;

  textEl.replaceWith(editInput);
  editInput.focus();
  editInput.select();

  function finishEditing() {
    const newText = editInput.value.trim();
    if (newText !== '') {
      task.text = newText;
      saveTasks();
    }
    renderTasks();
  }

  editInput.addEventListener('blur', finishEditing);
  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      editInput.blur();
    }
    if (e.key === 'Escape') {
      renderTasks();
    }
  });
}

// ----- CRUD -----
function addTask(text, category, priority, due) {
  tasks.push({
    id: Date.now().toString(),
    text,
    done: false,
    category: (category || '').trim(),
    priority: priority || 'medium',
    due: due || '',
  });
  saveTasks();
  renderTasks();
}

function toggleTask(id, checkEl) {
  const task = tasks.find((t) => t.id === id);
  const willBeDone = task && !task.done;

  tasks = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  saveTasks();
  renderTasks();

  if (willBeDone) {
    // Find the freshly rendered checkbox for this task to anchor the confetti
    const freshItem = list.querySelector(`[data-id="${id}"] .task-item__check`);
    if (freshItem) launchConfetti(freshItem);
  }
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function clearCompleted() {
  tasks = tasks.filter((task) => !task.done);
  saveTasks();
  renderTasks();
}

// ----- Drag-and-drop reordering -----
function reorderTasks(draggedTaskId, targetTaskId) {
  if (!draggedTaskId || draggedTaskId === targetTaskId) return;

  const fromIndex = tasks.findIndex((t) => t.id === draggedTaskId);
  const toIndex = tasks.findIndex((t) => t.id === targetTaskId);
  if (fromIndex === -1 || toIndex === -1) return;

  const [moved] = tasks.splice(fromIndex, 1);
  tasks.splice(toIndex, 0, moved);

  saveTasks();
  renderTasks();
}

// ----- Form submit -----
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = input.value.trim();
  if (value === '') return;

  addTask(value, categoryInput.value, priorityInput.value, dueInput.value);
  input.value = '';
  categoryInput.value = '';
  dueInput.value = '';
  priorityInput.value = 'medium';
  input.focus();
});

clearDoneButton.addEventListener('click', clearCompleted);

// ----- Search + filter -----
searchInput.addEventListener('input', (e) => {
  searchTerm = e.target.value;
  renderTasks();
});

filterSelect.addEventListener('change', (e) => {
  filterMode = e.target.value;
  renderTasks();
});

// ----- Dark mode -----
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.querySelector('.theme-toggle__icon').textContent = theme === 'dark' ? '☀️' : '🌙';
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
});

// ----- Init -----
initTheme();
renderTasks();

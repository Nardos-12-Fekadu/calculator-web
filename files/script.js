// ----- Grab the elements we need from the page -----
const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const taskCount = document.getElementById('task-count');
const clearDoneButton = document.getElementById('clear-done');

// The key we'll use to store our tasks in the browser's localStorage
const STORAGE_KEY = 'ledger-tasks';

// ----- Load any tasks that were saved from a previous visit -----
// If nothing is saved yet, we start with an empty list.
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// ----- Save the current tasks array to localStorage -----
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ----- Draw the tasks on the page -----
// We rebuild the whole list every time something changes.
// This is simpler than trying to update individual pieces of the DOM by hand.
function renderTasks() {
  list.innerHTML = '';

  tasks.forEach((task) => {
    const item = document.createElement('li');
    item.className = 'task-item' + (task.done ? ' task-item--done' : '');

    // The round checkbox button
    const check = document.createElement('button');
    check.className = 'task-item__check';
    check.setAttribute('aria-label', task.done ? 'Mark as not done' : 'Mark as done');
    check.addEventListener('click', () => toggleTask(task.id));

    // The task text itself
    const text = document.createElement('span');
    text.className = 'task-item__text';
    text.textContent = task.text;

    // The delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-item__delete';
    deleteBtn.textContent = 'remove';
    deleteBtn.setAttribute('aria-label', `Remove "${task.text}"`);
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    item.appendChild(check);
    item.appendChild(text);
    item.appendChild(deleteBtn);
    list.appendChild(item);
  });

  // Show a friendly message when there's nothing to do
  emptyState.style.display = tasks.length === 0 ? 'block' : 'none';

  // Update the "X open" counter at the bottom
  const openCount = tasks.filter((task) => !task.done).length;
  taskCount.textContent = `${openCount} open`;
}

// ----- Add a new task -----
function addTask(text) {
  tasks.push({
    id: Date.now().toString(), // a quick, simple unique ID
    text: text,
    done: false,
  });
  saveTasks();
  renderTasks();
}

// ----- Toggle a task between done / not done -----
function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, done: !task.done } : task
  );
  saveTasks();
  renderTasks();
}

// ----- Delete a single task -----
function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

// ----- Clear every task marked as done -----
function clearCompleted() {
  tasks = tasks.filter((task) => !task.done);
  saveTasks();
  renderTasks();
}

// ----- Handle the form submit (when the user clicks "Add" or hits Enter) -----
form.addEventListener('submit', (event) => {
  event.preventDefault(); // stop the page from reloading
  const value = input.value.trim();
  if (value === '') return; // ignore empty entries

  addTask(value);
  input.value = '';
  input.focus();
});

clearDoneButton.addEventListener('click', clearCompleted);

// ----- Draw the list as soon as the page loads -----
renderTasks();

// ============================================================
//  EXPENSE TRACKER — script.js
//  Pattern from class: Expense class (small) + ExpenseTracker
//  class (big container), single render() after every change.
// ============================================================

// constructor
// parseFloat converts the amount string from the input into a number
class Expense {
  constructor(id, description, amount, category, date) {
    this.id = id;
    this.description = description;
    this.amount = parseFloat(amount); 
    this.category = category;
    this.date = date;
  }
}

class ExpenseTracker {
  constructor() {
    this.expenses = [];   
    this.nextId = 1;      
  }

  add(description, amount, category, date) {
    const expense = new Expense(this.nextId, description, amount, category, date);
    this.nextId++;
    this.expenses.push(expense);
    this.save();
  }
  // filter() keeps every expense whose ID does NOT match
  // so the deleted one gets dropped from the array
  remove(id) {
    this.expenses = this.expenses.filter(e => e.id !== id);
    this.save();
  }

  getFiltered(category, sortBy) {
    let result = (category === 'All')
      ? [...this.expenses]
      : this.expenses.filter(e => e.category === category);

    result.sort((a, b) => {
      if (sortBy === 'date-desc')   return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc')    return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc')  return a.amount - b.amount;
      return 0;
    });

    return result;
  }

  getTotal(expenses) {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }
  // reduce() builds an object instead of a number
  // || 0 handles first time a category appears (avoids undefined + number)
  getCategoryTotals(expenses) {
    return expenses.reduce((totals, e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
      return totals;
    }, {});
  }


  save() {
    localStorage.setItem('expenseTrackerData', JSON.stringify({
      expenses: this.expenses,
      nextId: this.nextId
    }));
  }

  // Runs once on page load to restore saved data
  // try/catch prevents a crash if localStorage data is corrupt or missing
  load() {
    try {
      const raw = localStorage.getItem('expenseTrackerData');
      if (!raw) return;                       

      const data = JSON.parse(raw);

      this.expenses = data.expenses.map(e =>
        new Expense(e.id, e.description, e.amount, e.category, e.date)
      );
      this.nextId = data.nextId;
    } catch (err) {
      this.expenses = [];
      this.nextId = 1;
    }
  }
}


// Create the tracker and load any saved data before anything else runs
const tracker = new ExpenseTracker();
tracker.load();

// Grab all element references once at the top
const form            = document.getElementById('expense-form');
const descriptionInput= document.getElementById('description');
const amountInput     = document.getElementById('amount');
const categoryInput   = document.getElementById('category');
const dateInput       = document.getElementById('date');
const formError       = document.getElementById('form-error');

const filterSelect    = document.getElementById('filter-category');
const sortSelect      = document.getElementById('sort-by');

const totalAmountEl   = document.getElementById('total-amount');
const expenseCountEl  = document.getElementById('expense-count');
const categoryTotalsEl= document.getElementById('category-totals');
const expenseListEl   = document.getElementById('expense-list');

const convertBtn      = document.getElementById('convert-btn');
const convertedEl     = document.getElementById('converted-amount');



dateInput.value = new Date().toISOString().split('T')[0];

// Render- called after every single state change
// Always wipes and rebuilds the DOM from the expenses array
function render() {
  const filterVal = filterSelect.value;
  const sortVal   = sortSelect.value;

  // Get the current filtered + sorted list from the tracker
  const filtered = tracker.getFiltered(filterVal, sortVal);

  expenseListEl.innerHTML = '';   

  if (filtered.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty-state';
    li.textContent = (filterVal === 'All')
      ? 'No expenses yet — add one above!'
      : `No expenses in the "${filterVal}" category.`;
    expenseListEl.appendChild(li);

  } else {
    filtered.forEach(expense => {
      const li = document.createElement('li');
      li.className = 'expense-item';

      li.innerHTML = `
        <div class="expense-info">
          <span class="expense-description">${expense.description}</span>
          <span class="expense-meta">${expense.category} · ${expense.date}</span>
        </div>
        <div class="expense-right">
          <span class="expense-amount">$${expense.amount.toFixed(2)}</span>
          <button class="delete-btn" data-id="${expense.id}">Delete</button>
        </div>
      `;

      expenseListEl.appendChild(li);
    });
  }

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      tracker.remove(id);
      render();
    });
  });

  const total = tracker.getTotal(filtered);
  totalAmountEl.textContent = `$${total.toFixed(2)}`;
  expenseCountEl.textContent = `${filtered.length} expense${filtered.length !== 1 ? 's' : ''}`;

  const catTotals = tracker.getCategoryTotals(filtered);
  categoryTotalsEl.innerHTML = '';

  Object.entries(catTotals).forEach(([cat, amt]) => {
    const div = document.createElement('div');
    div.className = 'cat-total';
    div.innerHTML = `<span>${cat}:</span> $${amt.toFixed(2)}`;
    categoryTotalsEl.appendChild(div);
  });

  convertedEl.classList.add('hidden');
  convertedEl.classList.remove('error');
  convertedEl.textContent = '';
}

// handles form submit, validation, and adding to tracker
form.addEventListener('submit', e => {
  e.preventDefault();   

  const description = descriptionInput.value.trim();
  const amount      = parseFloat(amountInput.value);
  const category    = categoryInput.value;
  const date        = dateInput.value;

  if (!description) {
    showError('Description cannot be empty.');
    return;
  }
  if (!amount || amount <= 0) {
    showError('Amount must be greater than $0.00.');
    return;
  }
  if (!date) {
    showError('Please select a date.');
    return;
  }

  clearError();

  tracker.add(description, amount, category, date);

  descriptionInput.value = '';
  amountInput.value = '';
  dateInput.value = new Date().toISOString().split('T')[0];

  render();
});

function showError(msg) {
  formError.textContent = msg;
  formError.classList.remove('hidden');
}

function clearError() {
  formError.textContent = '';
  formError.classList.add('hidden');
}



filterSelect.addEventListener('change', render);
sortSelect.addEventListener('change', render);

// async fetch for live EUR conversion
convertBtn.addEventListener('click', async () => {
  // Get the current filtered total to convert
  const filtered = tracker.getFiltered(filterSelect.value, sortSelect.value);
  const total    = tracker.getTotal(filtered);

  convertBtn.disabled = true;
  convertBtn.textContent = 'Converting...';
  convertedEl.classList.add('hidden');
  convertedEl.classList.remove('error');

  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    const rate  = data.rates.EUR;
    const converted = (total * rate).toFixed(2);

    convertedEl.textContent = `≈ €${converted} EUR`;
    convertedEl.classList.remove('hidden');

  } catch (err) {
    convertedEl.textContent = 'Error: could not fetch exchange rate.';
    convertedEl.classList.remove('hidden');
    convertedEl.classList.add('error');
  } finally {
    convertBtn.disabled = false;
    convertBtn.textContent = 'Convert to EUR';
  }
});

//intial render
render();
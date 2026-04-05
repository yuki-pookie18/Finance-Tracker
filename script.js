let transactions = JSON.parse(localStorage.getItem('budget_tx') || '[]');
let pieChart = null;

const CAT_COLORS = [
  '#c8a97e', '#b05a5a', '#5a9e6f', '#7e9ec8',
  '#9e7ec8', '#c8c07e', '#7ec8c0', '#c87e9e', '#9ec87e',
];

// Init
document.getElementById('txDate').valueAsDate = new Date();
document.getElementById('monthTag').textContent =
  new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

document.getElementById('btnAdd').addEventListener('click', addTransaction);
document.getElementById('btnClear').addEventListener('click', clearAll);
document.getElementById('txAmount').addEventListener('keydown', e => { if (e.key === 'Enter') addTransaction(); });
document.getElementById('txName').addEventListener('keydown',   e => { if (e.key === 'Enter') addTransaction(); });

render();

// Helpers
function save() {
  localStorage.setItem('budget_tx', JSON.stringify(transactions));
}

function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Add
function addTransaction() {
  const name   = document.getElementById('txName').value.trim();
  const amount = parseFloat(document.getElementById('txAmount').value);
  const type   = document.getElementById('txType').value;
  const cat    = document.getElementById('txCategory').value;
  const date   = document.getElementById('txDate').value;

  if (!name || isNaN(amount) || amount <= 0) return;

  transactions.unshift({ id: Date.now(), name, amount, type, cat, date });
  save();
  render();

  document.getElementById('txName').value = '';
  document.getElementById('txAmount').value = '';
  document.getElementById('txDate').valueAsDate = new Date();
}

// Delete
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  save();
  render();
}

// Clear all
function clearAll() {
  if (!transactions.length) return;
  if (confirm('Clear all transactions?')) {
    transactions = [];
    save();
    render();
  }
}

// Main render
function render() {
  const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  document.getElementById('totalIncome').textContent  = fmt(income);
  document.getElementById('totalExpense').textContent = fmt(expense);
  document.getElementById('totalBalance').textContent  = fmt(balance);

  document.getElementById('totalBalance').style.color =
    balance < 0 ? 'var(--red)' : balance === 0 ? 'var(--sub)' : 'var(--accent)';

  const ratio = income > 0 ? Math.min((expense / income) * 100, 100) : 0;
  document.getElementById('barFill').style.width = ratio + '%';
  document.getElementById('ratioText').textContent = income > 0
    ? `${Math.round(ratio)}% of income spent`
    : 'No income recorded';

  renderList();
  renderChart();
  renderBreakdown();
}

// Transaction list
function renderList() {
  const list = document.getElementById('txList');
  const emptyMsg = document.getElementById('emptyMsg');

  if (!transactions.length) {
    list.innerHTML = '';
    list.appendChild(emptyMsg);
    emptyMsg.style.display = 'block';
    return;
  }

  emptyMsg.style.display = 'none';
  list.innerHTML = transactions.map(t => `
    <div class="tx-item ${t.type}">
      <div class="tx-left">
        <div class="tx-name">${escHtml(t.name)}</div>
        <div class="tx-meta">${escHtml(t.cat)} · ${fmtDate(t.date)}</div>
      </div>
      <div class="tx-right">
        <div class="tx-amount ${t.type}">${t.type === 'income' ? '+' : '−'}${fmt(t.amount)}</div>
        <button class="tx-del" onclick="deleteTransaction(${t.id})">✕</button>
      </div>
    </div>
  `).join('');
}

// Donut chart
function renderChart() {
  const expTx = transactions.filter(t => t.type === 'expense');
  const chartSection = document.getElementById('chartSection');

  if (!expTx.length) {
    chartSection.style.display = 'none';
    if (pieChart) { pieChart.destroy(); pieChart = null; }
    return;
  }

  chartSection.style.display = 'block';

  const catMap = {};
  expTx.forEach(t => { catMap[t.cat] = (catMap[t.cat] || 0) + t.amount; });

  const labels = Object.keys(catMap);
  const data   = Object.values(catMap);
  const total  = data.reduce((s, v) => s + v, 0);
  const colors = labels.map((_, i) => CAT_COLORS[i % CAT_COLORS.length]);

  if (pieChart) { pieChart.destroy(); pieChart = null; }

  pieChart = new Chart(document.getElementById('pieChart').getContext('2d'), {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.map(c => c + 'cc'),
        borderColor: colors,
        borderWidth: 1.5,
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: true,
      cutout: '62%',
      animation: { animateRotate: true, duration: 500 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e1a16',
          borderColor: '#2e2820',
          borderWidth: 1,
          titleColor: '#e8ddd0',
          bodyColor: '#8a7d6e',
          titleFont: { family: "'JetBrains Mono'", size: 11 },
          bodyFont:  { family: "'JetBrains Mono'", size: 11 },
          callbacks: {
            label: ctx => ` ₹${ctx.parsed.toLocaleString('en-IN')} (${((ctx.parsed / total) * 100).toFixed(1)}%)`,
          },
        },
      },
    },
  });

  document.getElementById('chartLegend').innerHTML = labels.map((label, i) => `
    <div class="legend-item">
      <div class="legend-dot" style="background:${colors[i]}"></div>
      <span class="legend-name">${escHtml(label)}</span>
      <span class="legend-pct">${((data[i] / total) * 100).toFixed(1)}%</span>
    </div>
  `).join('');
}

// Category bars
function renderBreakdown() {
  const expTx = transactions.filter(t => t.type === 'expense');
  const breakdown = document.getElementById('breakdown');

  if (!expTx.length) { breakdown.style.display = 'none'; return; }
  breakdown.style.display = 'block';

  const catMap = {};
  expTx.forEach(t => { catMap[t.cat] = (catMap[t.cat] || 0) + t.amount; });
  const maxVal = Math.max(...Object.values(catMap));

  document.getElementById('catList').innerHTML = Object.entries(catMap)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, amt]) => `
      <div class="cat-row">
        <div class="cat-name">${escHtml(cat)}</div>
        <div class="cat-track">
          <div class="cat-fill" style="width:${(amt / maxVal) * 100}%"></div>
        </div>
        <div class="cat-amt">${fmt(amt)}</div>
      </div>
    `).join('');
}
let currentRate = 1;
let chart, selectedIndex = null;

async function loadCurrentRate() {
  const res = await fetch("https://www.cbr-xml-daily.ru/daily_json.js");
  const data = await res.json();
  currentRate = data.Valute.EUR.Value;
  document.getElementById('result').textContent = `Курс EUR сегодня: ${currentRate.toFixed(2)} ₽`;
}

function setupConverter(rate) {
  const rubInput = document.getElementById('rub');
  const eurInput = document.getElementById('eur');
  const btn = document.getElementById('convertBtn');

  btn.addEventListener('click', () => {
    const rub = parseFloat(rubInput.value);
    const eur = parseFloat(eurInput.value);
    if (!isNaN(rub) && rubInput.value !== '') {
      eurInput.value = (rub / rate).toFixed(2);
    } else if (!isNaN(eur) && eurInput.value !== '') {
      rubInput.value = (eur * rate).toFixed(2);
    } else {
      eurInput.value = '';
      rubInput.value = '';
    }
  });
}

async function loadMonthlyRates() {
  const today = new Date();
  const labels = [], rates = [];

  for (let i = 30; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const label = `${dd}.${mm}`;
    const url = `https://www.cbr-xml-daily.ru/archive/${yyyy}/${mm}/${dd}/daily_json.js`;

    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const rate = data.Valute?.EUR?.Value;
      if (rate) {
        labels.push(label);
        rates.push(rate.toFixed(2));
      }
    } catch {}
  }

  drawChart(labels, rates);
}

function drawChart(labels, rates) {
  const ctx = document.getElementById('rateChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Курс EUR (₽)',
        data: rates,
        
        backgroundColor: labels.map(() => 'rgb(170, 170, 11)')
      }]
    },
    options: {
      responsive: true,
      onClick: (e, elements) => {
        if (elements.length) {
          const idx = elements[0].index;
          highlightBar(idx, labels[idx], rates[idx]);
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => `₽ ${ctx.raw}`
          }
        }
      },
      scales: { y: { beginAtZero: false } }
    }
  });
}

function highlightBar(index, date, rate) {
  
  if (selectedIndex !== null) {
    chart.data.datasets[0].backgroundColor[selectedIndex] = 'rgb(170, 170, 11)';
  }
  
  chart.data.datasets[0].backgroundColor[index] = 'grey';

  chart.update();
  selectedIndex = index;

  const info = document.getElementById('info');
  info.innerHTML = `<strong>Дата:</strong> ${date} &nbsp;&nbsp; <strong>Курс:</strong> ₽ ${rate}`;
  info.style.display = 'block';
}

window.addEventListener('DOMContentLoaded', async () => {
  await loadCurrentRate();
  setupConverter(currentRate);
  loadMonthlyRates();
});

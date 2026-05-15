// ── DATA ──────────────────────────────────────────────────────────────────────
const WMT = {
  q1: { invest:428154,  iroas:1.70,  inc:3200000, label:'Q1 · Apr–Jun 2025', color:'#f59e0b', dot:'#f59e0b',
        impr:'229M', roas:'$45.18', lift:'15.99%', newBuyers:'47%' },
  q2: { invest:283142,  iroas:16.75, inc:4740000, label:'Q2 · Jul–Sep 2025', color:'#3b82f6', dot:'#3b82f6',
        impr:'124M', roas:'$52.63', lift:'18.22%', newBuyers:'52%' },
  q3: { invest:554700,  iroas:3.74,  inc:2080000, label:'Q3 · Oct–Dec 2025', color:'#e83d6a', dot:'#e83d6a',
        impr:'250M', roas:'$32.09', lift:'8.7%',  newBuyers:'N/A' },
};
const ROM = {
  q3: { iroas: 10.89, label: 'Q3 · Oct–Dec 2025', lift: '1.56%', color: '#26c6da' },
  q4: { iroas: 10.60, label: 'Q4 · Jan–Mar 2026', lift: '0.65%', color: '#00b0a0' },
};
const WMT_TOTAL_INVEST = WMT.q1.invest + WMT.q2.invest + WMT.q3.invest;
const Q_WEIGHTS = {
  q1: WMT.q1.invest / WMT_TOTAL_INVEST,
  q2: WMT.q2.invest / WMT_TOTAL_INVEST,
  q3: WMT.q3.invest / WMT_TOTAL_INVEST,
};
// Investment-weighted blended iROAS across Q1–Q3
const WMT_WEIGHTED_IROAS =
  Q_WEIGHTS.q1 * WMT.q1.iroas +
  Q_WEIGHTS.q2 * WMT.q2.iroas +
  Q_WEIGHTS.q3 * WMT.q3.iroas;   // ≈ $5.96

// ── HELPERS ───────────────────────────────────────────────────────────────────
const fmt  = (n, dec=1) => n>=1e9 ? '$'+(n/1e9).toFixed(dec)+'B'
                         : n>=1e6 ? '$'+(n/1e6).toFixed(dec)+'M'
                         : n>=1e3 ? '$'+(n/1e3).toFixed(dec)+'K'
                         : '$'+n.toFixed(0);
const fmtM = n => '$'+(n/1e6).toFixed(2)+'M';
const $    = id => document.getElementById(id);
const set  = (id, val) => { const el=$(id); if(el) el.textContent=val; };

function updateSliderTrack(el) {
  const p = ((+el.value - +el.min) / (+el.max - +el.min) * 100) + '%';
  el.style.setProperty('--pct', p);
}

// ── QUARTER SELECTION: WALMART ───────────────────────────────────────────────
let selectedQ = 'q3';  // default: most recent quarter

function selectQuarter(q) {
  selectedQ = q;
  const section = document.querySelector('.acc-section');
  section.querySelectorAll('.acc-item').forEach(item => item.classList.remove('selected', 'open'));
  const chosen = $('acc-' + q);
  if (chosen) chosen.classList.add('selected', 'open');
  section.querySelectorAll('.acc-header').forEach(h => h.setAttribute('aria-expanded', 'false'));
  const chosenHeader = chosen && chosen.querySelector('.acc-header');
  if (chosenHeader) chosenHeader.setAttribute('aria-expanded', 'true');
  updateAll();
}

function initAccordions() {
  document.querySelectorAll('.acc-section:not(.rom-acc-section) .acc-header').forEach(header => {
    const item = header.closest('.acc-item');
    const q    = item.id.replace('acc-', '');
    header.addEventListener('click', () => selectQuarter(q));
    header.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectQuarter(q); }
    });
  });
  selectQuarter('q3');
}

// ── QUARTER SELECTION: REST OF MARKET ─────────────────────────────────────────
let selectedRomQ = 'q3';  // default: most recent ROM quarter

function selectRomQuarter(q) {
  selectedRomQ = q;
  const section = document.querySelector('.rom-acc-section');
  section.querySelectorAll('.acc-item').forEach(item => item.classList.remove('selected', 'open'));
  const chosen = $('rom-acc-' + q);
  if (chosen) chosen.classList.add('selected', 'open');
  section.querySelectorAll('.acc-header').forEach(h => h.setAttribute('aria-expanded', 'false'));
  const chosenHeader = chosen && chosen.querySelector('.acc-header');
  if (chosenHeader) chosenHeader.setAttribute('aria-expanded', 'true');
  updateAll();
}

function initRomAccordions() {
  document.querySelectorAll('.rom-acc-section .acc-header').forEach(header => {
    const item = header.closest('.acc-item');
    const q    = item.id.replace('rom-acc-', '');
    header.addEventListener('click', () => selectRomQuarter(q));
    header.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectRomQuarter(q); }
    });
  });
  selectRomQuarter('q3');
}

// ── CHARTS ────────────────────────────────────────────────────────────────────
function makeBarChart(canvasId, labels, data, colors, yFmt) {
  return new Chart(document.getElementById(canvasId), {
    type:'bar',
    data:{ labels, datasets:[{ data, backgroundColor:colors.bg, borderColor:colors.border, borderWidth:2, borderRadius:6 }] },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label: ctx=>' '+yFmt(ctx.raw) } } },
      scales:{
        x:{ grid:{ color:'rgba(255,255,255,.07)' }, ticks:{ color:'#c8deff', font:{ size:10 } } },
        y:{ grid:{ color:'rgba(255,255,255,.07)' }, ticks:{ color:'#c8deff', font:{ size:10 }, callback:yFmt } },
      },
    },
  });
}

function initCharts() {
  makeBarChart('wmtQChart',
    ['Q1 · $1.70','Q2 · $16.75','Q3 · $3.74'],
    [WMT.q1.iroas, WMT.q2.iroas, WMT.q3.iroas],
    { bg:['rgba(245,158,11,.75)','rgba(59,130,246,.8)','rgba(232,61,106,.75)'],
      border:['#f59e0b','#3b82f6','#e83d6a'] },
    v => '$'+v.toFixed(2)
  );
}

// ── MAIN UPDATE ───────────────────────────────────────────────────────────────
function updateAll() {
  const invest = +$('invest-slider').value;
  updateSliderTrack($('invest-slider'));
  set('invest-label', fmtM(invest));

  // SAME $invest goes to BOTH channels simultaneously.
  const activeQ      = WMT[selectedQ];
  const activeRomQ   = ROM[selectedRomQ];
  const wmtReturn    = invest * activeQ.iroas;
  const romReturn    = invest * activeRomQ.iroas;
  const totalReturn  = wmtReturn + romReturn;
  const blendedIROAS = totalReturn / invest;

  // Per-quarter projected returns for WMT accordion rows
  const q1Proj = invest * WMT.q1.iroas;
  const q2Proj = invest * WMT.q2.iroas;
  const q3Proj = invest * WMT.q3.iroas;

  // Per-quarter projected returns for ROM accordion rows
  const romQ3Proj = invest * ROM.q3.iroas;
  const romQ4Proj = invest * ROM.q4.iroas;

  // ── Summary row ──
  set('invest-display', fmtM(invest));
  set('total-return-display', fmt(totalReturn));

  // ── Totals bar ──
  set('tb-invest', fmtM(invest));
  set('tb-wmt',    fmt(wmtReturn));
  set('tb-rom',    fmt(romReturn));
  set('tb-total',  fmt(totalReturn));
  set('tb-iroas',  '$'+blendedIROAS.toFixed(2));

  // ── Walmart card — reflects selected quarter exactly ──
  set('wmt-return',      fmt(wmtReturn));
  set('wmt-iroas-badge', activeQ.label.split(' · ')[0] + ' iROAS: $' + activeQ.iroas.toFixed(2));

  // Accordion projected returns
  set('q1-proj', fmt(q1Proj));  set('q1-proj-body', fmt(q1Proj));
  set('q2-proj', fmt(q2Proj));  set('q2-proj-body', fmt(q2Proj));
  set('q3-proj', fmt(q3Proj));  set('q3-proj-body', fmt(q3Proj));
  // Accordion bars: scale bar width to Q2 being 100% (highest iROAS)
  const maxIROAS = WMT.q2.iroas;
  ['q1','q2','q3'].forEach(q => {
    const bar = $(`acc-bar-${q}`);
    if (bar) bar.style.width = (WMT[q].iroas / maxIROAS * 100) + '%';
  });

  // ── ROM card ──
  set('rom-return', fmt(romReturn));
  set('rom-iroas-badge', activeRomQ.label.split(' · ')[0] + ' iROAS: $' + activeRomQ.iroas.toFixed(2));
  set('rom-q3-proj', fmt(romQ3Proj));  set('rom-q3-proj-body', fmt(romQ3Proj));
  set('rom-q4-proj', fmt(romQ4Proj));  set('rom-q4-proj-body', fmt(romQ4Proj));
  // ROM accordion bars: scale to Q3 being 100% (higher iROAS)
  const maxRomIROAS = ROM.q3.iroas;
  ['q3','q4'].forEach(q => {
    const bar = $(`rom-acc-bar-${q}`);
    if (bar) bar.style.width = (ROM[q].iroas / maxRomIROAS * 100) + '%';
  });

  // ── Total card ──
  set('total-return-big',  fmt(totalReturn));
  set('total-iroas-badge', 'Blended iROAS: $'+blendedIROAS.toFixed(2));
  set('tot-wmt-ret',  fmt(wmtReturn));
  set('tot-rom-ret',  fmt(romReturn));
  set('tot-invest',   fmtM(invest));
  set('tot-net',      fmt(totalReturn - invest));

  // ── Live chart (Walmart Q iROAS — static, no update needed) ──
}

document.addEventListener('DOMContentLoaded', () => {
  initCharts();
  initAccordions();
  initRomAccordions();
  updateAll();
});

// ── BRAND CALCULATORS: MIKE'S HARD & CAYMAN JACK ─────────────────────────────
const BRAND_DATA = {
  mh: { iroas: 11.16, color: '#fbbf24', accentRange: 'mh-range' },
  cj: { iroas: 16.82, color: '#22d3ee', accentRange: 'cj-range' },
};

function updateBrand(id) {
  const slider  = document.getElementById(id + '-slider');
  const invest  = +slider.value;
  const brand   = BRAND_DATA[id];
  const ret     = invest * brand.iroas;
  const net     = ret - invest;

  // Update slider track fill using same CSS custom prop trick
  updateSliderTrack(slider);

  set(id + '-invest-label', fmtM(invest));
  set(id + '-return',       fmt(ret));
  set(id + '-tb-invest',    fmtM(invest));
  set(id + '-tb-return',    fmt(ret));
  set(id + '-tb-net',       fmt(net));
}

// Init brand calculators on load
document.addEventListener('DOMContentLoaded', () => {
  ['mh', 'cj'].forEach(id => {
    const slider = document.getElementById(id + '-slider');
    if (slider) {
      // Set initial track gradient — default slider value maps to ~27% of range
      const pct = ((+slider.value - +slider.min) / (+slider.max - +slider.min) * 100) + '%';
      slider.style.setProperty('--pct', pct);
      updateBrand(id);
    }
  });
});

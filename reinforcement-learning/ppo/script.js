'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const input = (id, callback) => { const el = $(id); if (el) el.addEventListener('input', callback); };
  const fmt = (n, digits = 2) => Number(n).toFixed(digits);
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const oldTheme = (() => { try { return localStorage.getItem('ppo-theme'); } catch { return null; } })();
  if (oldTheme === 'light' || oldTheme === 'dark') document.documentElement.dataset.theme = oldTheme;
  $('themeToggle')?.addEventListener('click', () => {
    const newTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = newTheme;
    try { localStorage.setItem('ppo-theme', newTheme); } catch { /* storage optional */ }
  });
  const sidebar = $('sidebar');
  const toggle = $('menuToggle');
  toggle?.addEventListener('click', () => {
    const open = sidebar.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  sidebar?.querySelectorAll('nav a').forEach(link => link.addEventListener('click', () => {
    sidebar.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { sidebar?.classList.remove('open'); toggle?.setAttribute('aria-expanded', 'false'); }
  });
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navLinks = Array.from(document.querySelectorAll('.sidebar nav a'));
  const navObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    if (!visible.length) return;
    const hash = '#' + visible[0].target.id;
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === hash));
  }, { rootMargin: '-15% 0px -63% 0px', threshold: [0, 0.1, 0.4, 0.8] });
  sections.forEach(section => navObserver.observe(section));
  const updateProgress = () => {
    const total = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    $('progress').style.width = (100 * Math.min(1, scrollY / total)) + '%';
  };
  addEventListener('scroll', updateProgress, { passive: true });
  addEventListener('resize', updateProgress);
  updateProgress();

  function renderGAE() {
    const lambda = Number($('lambda').value);
    $('lambdaOut').textContent = fmt(lambda);
    const errors = [1, 0.5, -0.2, 0.8, 0.3];
    const gamma = 0.99;
    let total = 0;
    const container = $('gaeBars');
    container.replaceChildren();
    errors.forEach((error, i) => {
      const weight = Math.pow(gamma * lambda, i);
      const contribution = error * weight;
      total += contribution;
      const row = document.createElement('div');
      row.className = 'gae-row';
      const name = document.createElement('span');
      name.textContent = 'δ' + i + '=' + fmt(error, 1);
      const track = document.createElement('div');
      track.className = 'gae-track';
      const fill = document.createElement('div');
      fill.className = 'gae-fill ' + (error >= 0 ? 'gae-positive' : 'gae-negative');
      fill.style.width = (100 * weight) + '%';
      track.append(fill);
      const value = document.createElement('span');
      value.className = 'gae-weight';
      value.textContent = fmt(weight, 3) + ' × ' + fmt(error, 1);
      row.append(name, track, value);
      row.title = 'GAE 贡献：' + fmt(contribution, 4);
      container.append(row);
    });
    $('gaeSum').textContent = fmt(total, 4);
  }
  input('lambda', renderGAE);
  renderGAE();

  function renderDistribution() {
    const p = Number($('newProb').value);
    $('newProbOut').textContent = fmt(p);
    $('barA').style.width = (p * 100) + '%';
    $('barB').style.width = ((1 - p) * 100) + '%';
    $('newSplit').textContent = Math.round(p * 100) + '% / ' + Math.round((1 - p) * 100) + '%';
    $('ratioA').textContent = fmt(2 * p);
    $('ratioB').textContent = fmt(2 * (1 - p));
    const kl = 0.5 * Math.log(0.5 / p) + 0.5 * Math.log(0.5 / (1 - p));
    $('distKL').textContent = fmt(kl, 4);
  }
  input('newProb', renderDistribution);
  renderDistribution();

  // Rebuild the two curves directly from the original paper's per-sample objective.
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const svgNode = (tag, attrs = {}, text) => {
    const el = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
    if (text !== undefined) el.textContent = String(text);
    return el;
  };
  const xMap = r => 46 + 185 * r;
  const yMap = v => 125 - 22 * v;
  const objective = (r, advantage, eps) => Math.min(r * advantage, clamp(r, 1 - eps, 1 + eps) * advantage);
  function drawCurve(svg, advantage, r, eps) {
    svg.replaceChildren();
    const positive = advantage > 0;
    const color = positive ? '#57e9cf' : '#f6af6c';
    const threshold = positive ? 1 + eps : 1 - eps;
    const shadeX = positive ? xMap(threshold) : xMap(0);
    const shadeWidth = positive ? xMap(2) - shadeX : xMap(threshold) - shadeX;
    svg.append(svgNode('rect', { x: shadeX, y: 20, width: Math.max(0, shadeWidth), height: 211, fill: color, opacity: '.08' }));
    for (let n = -4; n <= 4; n += 2) {
      const y = yMap(n);
      svg.append(svgNode('line', { x1: 46, y1: y, x2: 416, y2: y, stroke: 'currentColor', opacity: '.13' }));
      svg.append(svgNode('text', { x: 37, y: y + 4, fill: 'currentColor', opacity: '.65', 'text-anchor': 'end', 'font-size': 11 }, n));
    }
    svg.append(svgNode('line', { x1: 46, y1: 20, x2: 46, y2: 231, stroke: 'currentColor', opacity: '.5' }));
    svg.append(svgNode('line', { x1: 46, y1: 125, x2: 416, y2: 125, stroke: 'currentColor', opacity: '.5' }));
    [0, 0.5, 1, 1.5, 2].forEach(tick => {
      svg.append(svgNode('text', { x: xMap(tick), y: 247, fill: 'currentColor', opacity: '.7', 'text-anchor': 'middle', 'font-size': 11 }, tick));
    });
    svg.append(svgNode('text', { x: 230, y: 262, fill: 'currentColor', opacity: '.7', 'text-anchor': 'middle', 'font-size': 10 }, '概率比率 r'));
    svg.append(svgNode('text', { x: 49, y: 14, fill: 'currentColor', opacity: '.7', 'font-size': 10 }, '目标值 L'));
    svg.append(svgNode('line', { x1: xMap(1), x2: xMap(1), y1: 20, y2: 231, stroke: 'currentColor', opacity: '.3', 'stroke-dasharray': '3 4' }));
    svg.append(svgNode('line', { x1: xMap(threshold), x2: xMap(threshold), y1: 20, y2: 231, stroke: color, opacity: '.75', 'stroke-dasharray': '5 4' }));
    const original = [], clipped = [];
    for (let i = 0; i <= 200; i++) {
      const q = i / 100;
      original.push(xMap(q) + ',' + yMap(q * advantage));
      clipped.push(xMap(q) + ',' + yMap(objective(q, advantage, eps)));
    }
    svg.append(svgNode('polyline', { points: original.join(' '), fill: 'none', stroke: '#8c9bb8', 'stroke-width': 2, 'stroke-dasharray': '6 5' }));
    svg.append(svgNode('polyline', { points: clipped.join(' '), fill: 'none', stroke: color, 'stroke-width': 3.2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    svg.append(svgNode('line', { x1: xMap(r), x2: xMap(r), y1: 20, y2: 231, stroke: '#ff727b', 'stroke-width': 1.5, 'stroke-dasharray': '3 4' }));
    svg.append(svgNode('circle', { cx: xMap(r), cy: yMap(objective(r, advantage, eps)), r: 5, fill: '#ff727b', stroke: '#fff', 'stroke-width': 1.5 }));
  }
  function renderClip() {
    const r = Number($('clipRatio').value);
    const eps = Number($('clipEps').value);
    const magnitude = Number($('clipAdv').value);
    $('clipRatioOut').textContent = fmt(r);
    $('clipEpsOut').textContent = fmt(eps);
    $('clipAdvOut').textContent = fmt(magnitude);
    drawCurve($('posChart'), magnitude, r, eps);
    drawCurve($('negChart'), -magnitude, r, eps);
    $('posValue').textContent = fmt(objective(r, magnitude, eps), 3);
    $('negValue').textContent = fmt(objective(r, -magnitude, eps), 3);
    $('posMessage').textContent = r > 1 + eps ? '正优势：继续增大概率比率，当前样本的裁剪目标保持不变。' : '正优势：该样本保留朝有利方向增大概率的梯度。';
    $('negMessage').textContent = r < 1 - eps ? '负优势：继续降低概率比率，当前样本的裁剪目标保持不变。' : '负优势：该样本保留朝有利方向降低概率的梯度。';
  }
  ['clipRatio', 'clipEps', 'clipAdv'].forEach(id => input(id, renderClip));
  document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
    const preset = button.dataset.preset;
    $('clipRatio').value = preset === 'benefit' ? '1.5' : preset === 'harm' ? '0.5' : '1';
    if (preset === 'reset') { $('clipEps').value = '0.2'; $('clipAdv').value = '1'; }
    renderClip();
  }));
  renderClip();
  $('copyCode')?.addEventListener('click', async () => {
    const button = $('copyCode');
    try {
      await navigator.clipboard.writeText($('ppoCode').textContent);
      button.textContent = '已复制 ✓';
    } catch { button.textContent = '复制不可用，请手动选择代码'; }
  });
})();
'use strict';

// Accessible, dependency-free interactions. KaTeX is an optional presentation layer.
const $ = (id) => document.getElementById(id);
const fixed = (n, digits = 2) => Number(n).toFixed(digits);
const signed = (n, digits = 2) => `${n > 0 ? '+' : ''}${fixed(n, digits)}`;
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

function renderMath() {
  if (typeof window.katex !== 'undefined') {
    document.querySelectorAll('.math-display').forEach((element) => {
      const raw = element.textContent.trim();
      try { window.katex.render(raw, element, { displayMode: true, throwOnError: false, strict: 'warn' }); }
      catch (error) { console.warn('Math fallback:', error); }
    });
  }
  if (typeof window.renderMathInElement !== 'undefined') {
    window.renderMathInElement(document.body, {
      delimiters: [
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true },
        { left: '$$', right: '$$', display: true }
      ],
      throwOnError: false,
      ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
    });
  }
}

function updatePolicy() {
  const p = Number($('prob').value);
  const action = document.querySelector('input[name="action"]:checked').value;
  const reward = Number($('reward').value);
  const baseline = Number($('baseline').value);
  const alpha = Number($('lr').value);
  const advantage = reward - baseline;
  const y = action === 'A' ? 1 : 0;
  const score = y - p;
  const theta = Math.log(p / (1 - p));
  const deltaTheta = alpha * advantage * score;
  const thetaAfter = theta + deltaTheta;
  const pAfter = 1 / (1 + Math.exp(-thetaAfter));
  const deltaP = pAfter - p;

  $('probValue').textContent = fixed(p * 100, 0) + '%';
  $('rewardValue').textContent = signed(reward, 1);
  $('baselineValue').textContent = fixed(baseline, 1);
  $('lrValue').textContent = fixed(alpha, 2);
  $('beforeA').textContent = fixed(p * 100) + '%';
  $('beforeB').textContent = fixed((1 - p) * 100) + '%';
  $('afterA').textContent = fixed(pAfter * 100) + '%';
  $('afterB').textContent = fixed((1 - pAfter) * 100) + '%';
  $('barBeforeA').style.width = `${p * 100}%`;
  $('barBeforeB').style.width = `${(1 - p) * 100}%`;
  $('barAfterA').style.width = `${pAfter * 100}%`;
  $('barAfterB').style.width = `${(1 - pAfter) * 100}%`;
  $('deltaTheta').textContent = signed(deltaTheta, 4);
  $('deltaProb').textContent = signed(deltaP * 100) + '%';
  $('deltaProb').style.color = Math.abs(deltaP) < 1e-12 ? 'var(--muted)' : deltaP > 0 ? 'var(--green)' : 'var(--rose)';
  $('liveEquation').textContent = `Δθ = ${fixed(alpha, 2)} × (${fixed(advantage, 2)}) × (${fixed(score, 2)}) = ${signed(deltaTheta, 4)}`;

  const badge = $('directionBadge');
  badge.classList.remove('negative', 'neutral');
  if (Math.abs(advantage) < 1e-10) {
    badge.textContent = '本次不更新';
    badge.classList.add('neutral');
    $('demoExplanation').textContent = '本次奖励等于基线；样本优势为零，因此策略参数不变。';
  } else if (advantage > 0) {
    badge.textContent = `强化动作 ${action}`;
    $('demoExplanation').textContent = `回报高于基线，已采样动作 ${action} 的概率提高。更新前的 P(${action}) = ${fixed((action === 'A' ? p : 1 - p) * 100)}%，更新后为 ${fixed((action === 'A' ? pAfter : 1 - pAfter) * 100)}%。`;
  } else {
    badge.textContent = `抑制动作 ${action}`;
    badge.classList.add('negative');
    $('demoExplanation').textContent = `回报低于基线，已采样动作 ${action} 的概率降低。即使原始奖励为正，低于参考线仍会产生负优势。`;
  }
}

function updateTrajectory() {
  const gamma = Number($('gamma').value);
  const reward = Number($('terminalReward').value);
  const g0 = gamma * gamma * reward;
  const g1 = gamma * reward;
  const g2 = reward;
  $('gammaValue').textContent = fixed(gamma);
  $('terminalRewardValue').textContent = signed(reward, 1);
  $('terminalTimelineLabel').textContent = `r₃ = ${signed(reward, 1)}`;
  $('g0').textContent = fixed(g0);
  $('g1').textContent = fixed(g1);
  $('g2').textContent = fixed(g2);
  $('g0formula').textContent = `${fixed(gamma)}² × (${fixed(reward, 1)})`;
  $('g1formula').textContent = `${fixed(gamma)} × (${fixed(reward, 1)})`;
}

function updateRelativeBaseline() {
  const g = Number($('relativeReturn').value);
  const b = Number($('relativeBaseline').value);
  const a = g - b;
  $('relativeReturnValue').textContent = fixed(g, 1);
  $('relativeBaselineValue').textContent = fixed(b, 1);
  const output = $('relativeAdvantage');
  output.textContent = signed(a, 1);
  output.classList.toggle('positive', a > 0);
  output.classList.toggle('neutral', a === 0);
  $('relativeExplanation').textContent = a > 0
    ? '本次回报高于基线：增加已采样动作的概率。'
    : a < 0
      ? (g > 0 ? '虽然原始回报为正，但低于基线：降低已采样动作的概率。' : '本次回报低于基线：降低已采样动作的概率。')
      : '本次回报与基线相同：样本优势为零，不更新策略。';
}

function bindExperiments() {
  ['prob', 'reward', 'baseline', 'lr'].forEach(id => $(id).addEventListener('input', updatePolicy));
  document.querySelectorAll('input[name="action"]').forEach(input => input.addEventListener('change', updatePolicy));
  $('resetDemo').addEventListener('click', () => {
    $('prob').value = '0.35';
    document.querySelector('input[name="action"][value="A"]').checked = true;
    $('reward').value = '1';
    $('baseline').value = '0';
    $('lr').value = '0.5';
    updatePolicy();
  });
  ['gamma', 'terminalReward'].forEach(id => $(id).addEventListener('input', updateTrajectory));
  ['relativeReturn', 'relativeBaseline'].forEach(id => $(id).addEventListener('input', updateRelativeBaseline));
  updatePolicy();
  updateTrajectory();
  updateRelativeBaseline();
}

function bindNavigation() {
  const sidebar = $('sidebar');
  const menuToggle = $('menuToggle');
  menuToggle.addEventListener('click', () => {
    const open = sidebar.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? '关闭章节导航' : '打开章节导航');
  });
  document.querySelectorAll('.side-nav a').forEach(link => link.addEventListener('click', () => {
    sidebar.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '打开章节导航');
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.focus();
    }
  });
  const links = new Map([...document.querySelectorAll('.side-nav a')].map(link => [link.hash.slice(1), link]));
  const visibleSections = new Set();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visibleSections.add(entry.target.id) : visibleSections.delete(entry.target.id));
      const active = [...visibleSections].sort((a, b) => document.getElementById(a).getBoundingClientRect().top - document.getElementById(b).getBoundingClientRect().top)[0];
      if (active) links.forEach((link, id) => {
        link.classList.toggle('active', id === active);
        if (id === active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-17% 0px -57% 0px', threshold: 0 });
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
  }
  let scheduled = false;
  function updateProgress() {
    scheduled = false;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    $('readingProgress').style.width = `${clamp(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0, 0, 100)}%`;
  }
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

function bindCopy() {
  $('copyCode').addEventListener('click', async () => {
    const button = $('copyCode');
    try {
      await navigator.clipboard.writeText($('pytorchCode').textContent);
      button.textContent = '✓ 已复制';
    } catch (error) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents($('pytorchCode'));
      selection.removeAllRanges();
      selection.addRange(range);
      button.textContent = '已选中，请手动复制';
    }
  });
}

renderMath();
bindExperiments();
bindNavigation();
bindCopy();
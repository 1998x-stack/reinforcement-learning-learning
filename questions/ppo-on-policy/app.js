(() => {
  'use strict';
  const byId = (id) => document.getElementById(id);
  const pct = (value) => `${(value * 100).toFixed(0)}%`;
  const fix = (value) => Number(value).toFixed(2);
  const scalar = (id) => Number(byId(id).value);
  const write = (id, value) => { const node = byId(id); if (node) node.textContent = value; };
  const setWidth = (id, value) => { byId(id).style.width = pct(value); };

  // Timeline is a pedagogical snapshot of one PPO iteration, not a measured training run.
  function renderEpoch() {
    const n = scalar('epoch');
    const oldP = 0.35;
    const newP = oldP + 0.08 * n;
    write('epochOut', `${n} / 4`);
    setWidth('oldBar', oldP);
    setWidth('newBar', newP);
    write('oldText', `Pold(A) = ${pct(oldP)}`);
    write('newText', `Pθ(A) = ${pct(newP)}`);
    write('epochExplain', n === 0
      ? '第 0 步：当前 πθ 与刚采样的 πold 一致。旧概率和样本随本轮训练固定。'
      : `第 ${n} 次示意更新：当前 Pθ(A)=${pct(newP)}，采样时 Pold(A)=${pct(oldP)}。继续优化的仍是 Dₖ；它是本轮最新 rollout，而非无限期保留的历史数据。`);
  }

  // Exact two-action, one-transition toy MDP: P(sL at t=1) = P(A at s0).
  function renderDistribution() {
    const oldP = scalar('oldProb');
    const newP = scalar('newProb');
    const ra = newP / oldP;
    const rb = (1 - newP) / (1 - oldP);
    write('oldProbOut', pct(oldP));
    write('newProbOut', pct(newP));
    write('ratioA', `${fix(ra)}×`);
    write('ratioB', `${fix(rb)}×`);
    write('ratioAText', `${pct(newP)} ÷ ${pct(oldP)}`);
    write('ratioBText', `${pct(1-newP)} ÷ ${pct(1-oldP)}`);
    setWidth('stateOld', oldP);
    setWidth('stateNew', newP);
    write('stateOldOut', pct(oldP));
    write('stateNewOut', pct(newP));
    const equal = Math.abs(oldP - newP) < 1e-9;
    write('stateExplain', equal
      ? `新旧策略此时相同：访问 sL 的概率都为 ${pct(oldP)}。将新策略概率拉离旧策略，观察状态分布出现差异。`
      : `旧轨迹在第二时刻访问 sL 的概率仍是 ${pct(oldP)}；新策略真实访问 sL 的概率是 ${pct(newP)}。对旧轨迹中已出现状态的动作作单步重加权，不能将旧状态出现频率直接变成新状态出现频率。`);
  }

  const svgNS = 'http://www.w3.org/2000/svg';
  function svgNode(name, attrs, content) {
    const node = document.createElementNS(svgNS, name);
    Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, String(value)));
    if (content !== undefined) node.textContent = content;
    return node;
  }
  function appendSvg(parent, name, attrs, content) {
    const node = svgNode(name, attrs, content);
    parent.appendChild(node);
    return node;
  }
  function renderClip() {
    const r = scalar('ratio');
    const eps = scalar('epsilon');
    const selected = document.querySelector('input[name="adv"]:checked');
    const advantage = selected ? Number(selected.value) : 1;
    const lower = 1 - eps;
    const upper = 1 + eps;
    const raw = (x) => x * advantage;
    const clipped = (x) => Math.min(raw(x), Math.max(lower, Math.min(x, upper)) * advantage);
    write('ratioOut', fix(r));
    write('epsilonOut', fix(eps));
    write('rawOut', fix(raw(r)));
    write('clipOut', fix(clipped(r)));
    const limited = advantage > 0 ? r > upper : r < lower;
    const boundary = advantage > 0 ? `1+ε=${fix(upper)}` : `1−ε=${fix(lower)}`;
    write('clipExplain', limited
      ? `${advantage > 0 ? '正优势' : '负优势'}样本已经越过 ${boundary}：未裁剪值为 ${fix(raw(r))}，裁剪代理目标取 ${fix(clipped(r))}。这仅抑制某一方向的额外代理收益，不会将真实策略概率硬性截断。`
      : `${advantage > 0 ? '正优势' : '负优势'}样本当前位于未被该侧裁剪压平的区域，代理目标是 ${fix(clipped(r))}。移动 r 经过 ${boundary}，可观察曲线何时变为平台。`);

    const svg = byId('clipGraph');
    if (!svg) return;
    svg.replaceChildren();
    appendSvg(svg, 'title', {}, 'PPO Clip 代理目标与原始代理目标对比');
    appendSvg(svg, 'desc', {}, `当前概率比率 ${fix(r)}，epsilon ${fix(eps)}，优势 ${advantage > 0 ? '+1' : '-1'}，绿色为 min 裁剪目标，灰色虚线为 r 乘优势。`);
    const rect = {left: 46, top: 22, width: 540, height: 213};
    const minX = 0.2, maxX = 2, minY = -2.2, maxY = 2.2;
    const x = (v) => rect.left + (v-minX)/(maxX-minX)*rect.width;
    const y = (v) => rect.top + (maxY-v)/(maxY-minY)*rect.height;
    const gridColor = '#2e435b';
    for (let gy = -2; gy <= 2; gy += 1) {
      appendSvg(svg,'line',{x1:x(minX),y1:y(gy),x2:x(maxX),y2:y(gy),stroke:gridColor,'stroke-width':gy===0?1.5:1,'stroke-dasharray':gy===0?'none':'3 6'});
      appendSvg(svg,'text',{x:37,y:y(gy)+4,fill:'#a5bad0','text-anchor':'end'},String(gy));
    }
    for (const gx of [0.2,0.6,1,1.4,1.8,2]) {
      appendSvg(svg,'line',{x1:x(gx),y1:y(minY),x2:x(gx),y2:y(maxY),stroke:gridColor,'stroke-dasharray':'3 6'});
      appendSvg(svg,'text',{x:x(gx),y:255,fill:'#a5bad0','text-anchor':'middle'},fix(gx));
    }
    appendSvg(svg,'rect',{x:x(lower),y:rect.top,width:x(upper)-x(lower),height:rect.height,fill:'#62e8bb10'});
    [lower,upper].forEach((limit) => appendSvg(svg,'line',{x1:x(limit),y1:rect.top,x2:x(limit),y2:rect.top+rect.height,stroke:'#66d6b6','stroke-dasharray':'4 5','stroke-width':1.3}));
    const curve = (f) => {
      const points = [];
      for (let n=0;n<=240;n++) {
        const v = minX+(maxX-minX)*n/240;
        points.push(`${n===0?'M':'L'}${x(v).toFixed(2)},${y(f(v)).toFixed(2)}`);
      }
      return points.join(' ');
    };
    appendSvg(svg,'path',{d:curve(raw),fill:'none',stroke:'#9eaebf','stroke-dasharray':'6 5','stroke-width':2.2});
    appendSvg(svg,'path',{d:curve(clipped),fill:'none',stroke:'#65e4c0','stroke-width':3.1,'stroke-linecap':'round'});
    appendSvg(svg,'line',{x1:x(r),y1:rect.top,x2:x(r),y2:rect.top+rect.height,stroke:'#ffd18b','stroke-dasharray':'4 4','stroke-width':1.5});
    appendSvg(svg,'circle',{cx:x(r),cy:y(clipped(r)),r:5.4,fill:'#ffd18b',stroke:'#091b2a','stroke-width':1.5});
    appendSvg(svg,'text',{x:x(Math.max(minX+0.1,Math.min(maxX-0.1,r))),y:15,fill:'#ffd18b','text-anchor':'middle'},`r=${fix(r)}`);
    appendSvg(svg,'text',{x:590,y:256,fill:'#b5c9db','text-anchor':'end'},'概率比率 r →');
  }

  function initMath() {
    if (typeof window.renderMathInElement !== 'function') return;
    window.renderMathInElement(document.body, {
      delimiters:[{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false}],
      ignoredTags:['script','noscript','style','textarea','pre','code'],
      throwOnError:false
    });
    if (typeof window.katex !== 'undefined') {
      document.querySelectorAll('.display-math').forEach((element) => {
        try { window.katex.render(element.textContent.trim(), element, {displayMode:true, throwOnError:false, strict:'ignore'}); }
        catch(err) { console.warn('数学公式保持原文：', err); }
      });
    }
  }

  function initReading() {
    const bar = byId('readingBar');
    const links = [...document.querySelectorAll('.chapter-nav a')];
    const sections = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    let queued = false;
    function update() {
      queued = false;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = `${height > 0 ? Math.max(0, Math.min(100, window.scrollY/height*100)) : 100}%`;
      let current = sections[0];
      for (const section of sections) if (section.getBoundingClientRect().top < window.innerHeight * .38) current = section;
      links.forEach(link => link.classList.toggle('active', current && link.getAttribute('href') === `#${current.id}`));
    }
    window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, {passive:true});
    window.addEventListener('resize', update);
    update();
  }

  byId('epoch').addEventListener('input', renderEpoch);
  ['oldProb','newProb'].forEach(id => byId(id).addEventListener('input', renderDistribution));
  ['ratio','epsilon'].forEach(id => byId(id).addEventListener('input', renderClip));
  document.querySelectorAll('input[name="adv"]').forEach(input => input.addEventListener('change', renderClip));
  renderEpoch();
  renderDistribution();
  renderClip();
  initMath();
  initReading();
})();
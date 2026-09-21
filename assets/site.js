(() => {
  'use strict';
  const body = document.body;
  const prefix = body.dataset.rootPrefix || '';
  const view = body.dataset.view;
  const lookup = (id) => document.getElementById(id);
  const el = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  };
  const urlFor = (path) => prefix + path;
  const link = (href, label, className) => {
    const a = el('a', className, label);
    a.href = urlFor(href);
    return a;
  };
  function categoryCard(category) {
    const a = link(category.href, '', 'category-card surface-card');
    a.setAttribute('aria-label', `浏览${category.title}类别`);
    const top = el('div', 'category-card-top');
    top.append(el('span', 'pill', category.en || category.slug), el('span', 'card-arrow', '↗'));
    a.append(top, el('h3', '', category.title), el('p', '', category.description), el('div', 'card-bottom', `${category.courses.length} 个已发布专题 · 浏览类别 →`));
    return a;
  }
  function courseCard(course, category) {
    const a = link(course.href, '', 'course-card surface-card');
    a.dataset.search = [course.title, course.subtitle, course.eyebrow, category.title, ...(course.topics || [])].join(' ').toLocaleLowerCase();
    const top = el('div', 'course-card-top');
    top.append(el('span', 'eyebrow', course.eyebrow || 'INTERACTIVE LESSON'), el('span', 'card-arrow', '↗'));
    a.append(top, el('h3', '', course.title), el('p', '', course.subtitle));
    const tags = el('div', 'tags');
    (course.topics || []).forEach(tag => tags.append(el('span', 'tag', tag)));
    a.append(tags, el('div', 'card-bottom', '进入交互式课程 →'));
    return a;
  }
  async function init() {
    const path = body.dataset.catalogPath;
    if (!path) return;
    try {
      const response = await fetch(path, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`Catalog HTTP ${response.status}`);
      const catalog = await response.json();
      if (!Array.isArray(catalog.categories)) throw new Error('Invalid catalog');
      const categories = catalog.categories.filter(item => Array.isArray(item.courses) && item.href);
      const selected = view === 'category' ? categories.filter(item => item.slug === body.dataset.category) : categories;
      if (!selected.length) return;
      const categoryGrid = lookup('categoryGrid');
      if (categoryGrid) categoryGrid.replaceChildren(...selected.map(categoryCard));
      const courseGrid = lookup('courseGrid');
      if (!courseGrid) return;
      const entries = selected.flatMap(category => category.courses.map(course => ({ course, category })));
      const search = lookup('courseSearch');
      const counter = lookup('resultCount');
      const empty = lookup('emptyState');
      function render() {
        const query = search ? search.value.trim().toLocaleLowerCase() : '';
        const filtered = entries.filter(({ course, category }) => [course.title, course.subtitle, course.eyebrow, category.title, ...(course.topics || [])].join(' ').toLocaleLowerCase().includes(query));
        courseGrid.replaceChildren(...filtered.map(({ course, category }) => courseCard(course, category)));
        if (counter) counter.textContent = `已展示 ${filtered.length} / ${entries.length} 个课程`;
        if (empty) empty.hidden = filtered.length !== 0;
      }
      if (search) search.addEventListener('input', render);
      render();
    } catch (error) {
      console.warn('使用页面内置目录；动态目录不可用：', error);
      // 静态导航保留在 HTML 中；file:// 和离线环境仍能打开已发布课程。
    }
  }
  init();
})();

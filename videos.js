'use strict';
const search = document.querySelector('#video-search');
const categories = document.querySelector('#video-categories');
const grid = document.querySelector('#video-grid');
const more = document.querySelector('#video-more');
const dialog = document.querySelector('#video-dialog');
const player = document.querySelector('#video-player');
const names = ['花字', '标题', '转场', '素材罗列', '分屏画中画'];
let items = [], category = '', limit = 36, trigger = null;
function render() {
  const q = search.value.trim().toLocaleLowerCase();
  const matches = items.filter(i => (!category || i.category === category) && (!q || `${i.name} ${i.category} ${i.id}`.toLocaleLowerCase().includes(q)));
  grid.replaceChildren();
  for (const i of matches.slice(0, limit)) {
    const card = document.createElement('article'); card.className = 'video-card';
    const open = document.createElement('button'); open.className = 'video-open'; open.type = 'button'; open.setAttribute('aria-label', `播放 ${i.name}`);
    const preview = document.createElement('div'); preview.className = 'video-preview';
    const img = document.createElement('img'); img.src = i.poster; img.alt = ''; img.loading = 'lazy'; img.width = 480; img.height = 300;
    const play = document.createElement('span'); play.className = 'play-indicator'; play.textContent = `▶ ${i.duration.toFixed(1)}s`;
    preview.append(img, play);
    const body = document.createElement('div'); body.className = 'video-body';
    const label = document.createElement('small'); label.textContent = i.category;
    const title = document.createElement('h2'); title.textContent = i.name;
    body.append(label, title); open.append(preview, body); card.append(open); grid.append(card);
    open.addEventListener('click', () => show(i, open));
  }
  document.querySelector('#video-count').textContent = `共 ${matches.length} 段视频 · 已显示 ${Math.min(limit, matches.length)} 段`;
  document.querySelector('#video-empty').hidden = matches.length !== 0;
  more.hidden = limit >= matches.length;
  for (const button of categories.querySelectorAll('button')) button.setAttribute('aria-pressed', String(button.dataset.category === category));
}
function show(i, button) {
  trigger = button;
  document.querySelector('#playing-title').textContent = i.name;
  document.querySelector('#playing-category').textContent = i.category;
  document.querySelector('#playing-info').textContent = `${i.duration.toFixed(2)} 秒 · MP4 · ${(i.bytes / 1e6).toFixed(1)} MB`;
  document.querySelector('#play-error').hidden = true;
  const download = document.querySelector('#video-download'); download.href = i.video; download.download = `${i.name}.mp4`;
  player.poster = i.poster; player.src = i.video; dialog.showModal();
  player.play().catch(() => {});
}
player.addEventListener('error', () => { document.querySelector('#play-error').hidden = false; });
document.querySelector('#video-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
dialog.addEventListener('close', () => { player.pause(); player.removeAttribute('src'); player.load(); if (trigger?.isConnected) trigger.focus(); });
search.addEventListener('input', () => { limit = 36; render(); });
more.addEventListener('click', () => { limit += 36; render(); });
fetch('data/eagle-videos.json').then(r => { if (!r.ok) throw Error(r.status); return r.json(); }).then(data => {
  items = data.items;
  for (const name of ['', ...names]) {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.category = name;
    button.textContent = `${name || '全部'} ${name ? items.filter(i => i.category === name).length : items.length}`;
    button.addEventListener('click', () => { category = name; limit = 36; render(); }); categories.append(button);
  }
  render();
}).catch(() => { document.querySelector('#video-error').hidden = false; document.querySelector('#video-count').textContent = '目录加载失败'; });

/* Touch feedback follows an explicit choice on devices which expose vibration. */
(() => {
  if (typeof navigator.vibrate !== 'function') return;
  const options = 'button[aria-pressed],button[role="tab"],button[role="switch"],button[aria-selected],button[data-step]';
  document.addEventListener('click', event => {
    if (!event.isTrusted || !event.detail || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const touch = 'pointerType' in event ? event.pointerType === 'touch' : matchMedia('(pointer: coarse)').matches;
    if (!touch || !(event.target instanceof Element)) return;
    const control = event.target.closest(options);
    if (!control || control.matches(':disabled,[aria-disabled="true"]')) return;
    navigator.vibrate(8);
  }, {passive: true});
})();

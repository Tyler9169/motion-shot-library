/* TypeMotion — reference-driven text choreography.
 * Adapted from HyperFrames text-stagger + soft-blur-in primitives.
 * Needs local GSAP 3 and motion.css. No text is interpreted as HTML.
 */
(function (global) {
  'use strict';
  const presets = Object.freeze({
    'left-bounce': { label: '左弹', title: 'Jensen\nHuang', subtitle: 'just 4% of', start: .10, stagger: .30, enter: .40, typing: 1.15, typed: 2.10 },
    'right-bounce': { label: '右弹', title: 'Jeff Bezos', subtitle: 'only 9% of', start: .12, stagger: .28, enter: .35, typing: 1.05, typed: 2.10 },
    'blur-up': { label: '模糊上', title: 'Elon Musk', subtitle: 'owns just 20% of', start: .08, stagger: .22, enter: .35, typing: .72, typed: 2.00 }
  });
  const instances = new WeakMap();
  const graphemes = text => typeof Intl.Segmenter === 'function'
    ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), part => part.segment)
    : Array.from(text);
  // Latin runs stay together; Han, kana and Hangul title glyphs get their own beat.
  function titleParts(text) {
    return (text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]|[^\s\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]+/gu) || []);
  }
  function node(tag, className, text) {
    const el = document.createElement(tag);
    el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function mount(container, options = {}) {
    if (!(container instanceof Element)) throw new TypeError('TypeMotion.mount needs a DOM element');
    if (!global.gsap) throw new Error('Load assets/gsap.min.js before motion.js');
    if (instances.has(container)) instances.get(container).destroy();
    const preset = Object.hasOwn(presets, options.preset) ? options.preset : 'left-bounce';
    const p = presets[preset];
    const title = String(options.title ?? p.title);
    const subtitle = String(options.subtitle ?? p.subtitle);
    const speedValue = Number(options.speed ?? 1);
    const speed = Number.isFinite(speedValue) ? Math.max(.25, Math.min(4, speedValue)) : 1;
    const sizeValue = Number(options.fontSize ?? 72);
    const size = Number.isFinite(sizeValue) ? Math.max(16, Math.min(240, sizeValue)) : 72;
    const t = seconds => seconds / speed;
    const root = node('div', 'tm-root');
    root.dataset.preset = preset;
    root.style.setProperty('--tm-size', size + 'px');
    root.style.setProperty('--tm-color', options.color || '#111111');
    root.style.setProperty('--tm-accent', options.accent || '#e62919');
    const heading = node('div', 'tm-title');
    heading.setAttribute('role', 'heading');
    heading.setAttribute('aria-level', '2');
    heading.setAttribute('aria-label', title);
    const parts = title.split(/(\n)/).flatMap(part => part === '\n' ? [part] : titleParts(part));
    const words = [];
    parts.forEach((part) => {
      if (part === '\n') {
        const lineBreak = node('span', 'tm-line-break');
        lineBreak.setAttribute('aria-hidden', 'true');
        heading.append(lineBreak);
        return;
      }
      const mask = node('span', 'tm-mask');
      const word = node('span', 'tm-word', part);
      // Overflow is the intended entrance mask, not a layout defect.
      mask.setAttribute('data-layout-allow-overflow', 'true');
      word.setAttribute('data-layout-allow-overflow', 'true');
      mask.setAttribute('aria-hidden', 'true');
      mask.append(word);
      heading.append(mask);
      words.push(word);
    });
    if (/^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\s]+$/u.test(title)) heading.classList.add('tm-title-cjk');
    const sub = node('div', 'tm-subtitle');
    sub.setAttribute('aria-label', subtitle);
    const initial = node('span', 'tm-cursor tm-cursor-initial');
    initial.setAttribute('aria-hidden', 'true');
    sub.append(initial);
    const glyphs = [], cursors = [initial];
    graphemes(subtitle).forEach(char => {
      const slot = node('span', 'tm-char-slot');
      slot.setAttribute('aria-hidden', 'true');
      const glyph = node('span', 'tm-glyph', char);
      glyph.setAttribute('data-layout-allow-occlusion', 'true');
      const cursor = node('span', 'tm-cursor');
      slot.append(glyph, cursor); sub.append(slot);
      glyphs.push(glyph); cursors.push(cursor);
    });
    root.append(heading, sub); container.append(root);
    const timeline = global.gsap.timeline({ paused: true });
    const gap = words.length > 1 ? Math.min(p.stagger, .48 / (words.length - 1)) : 0;
    words.forEach((word, i) => {
      const start = t(p.start + i * gap);
      if (preset === 'left-bounce') {
        timeline.fromTo(word, { xPercent: 110, opacity: 1 }, { xPercent: 0, duration: t(p.enter), ease: 'back.out(1.05)' }, start);
      } else if (preset === 'right-bounce') {
        timeline.fromTo(word, { x: -size * .19, yPercent: 112, opacity: 1 }, { x: 0, yPercent: 0, duration: t(p.enter), ease: 'back.out(1.1)' }, start);
      } else {
        timeline.fromTo(word, { y: size * .65, opacity: 0, filter: 'blur(' + size * .12 + 'px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: t(p.enter), ease: 'power3.out' }, start);
      }
    });
    // Every glyph keeps its full layout slot while invisible. Cursor positions
    // are DOM anchors, so changing fonts/viewport never invalidates pixel math.
    timeline.set(glyphs, { opacity: 0 }, 0);
    timeline.set(cursors, { opacity: 0 }, 0);
    if (glyphs.length) {
      timeline.set(initial, { opacity: 1 }, t(p.typing));
      glyphs.forEach((glyph, i) => {
        const at = t(p.typing + (p.typed - p.typing) * (i + 1) / glyphs.length);
        timeline.set(glyph, { opacity: 1 }, at);
        timeline.set(cursors[i], { opacity: 0 }, at);
        timeline.set(cursors[i + 1], { opacity: 1 }, at);
      });
      timeline.set(cursors[cursors.length - 1], { opacity: 0 }, t(p.typed + .08));
    }
    // Real visual hold defines duration (no hidden counters or wall clocks).
    timeline.to(root, { opacity: 1, duration: t(.001), ease: 'none' }, t(3 - .001));
    timeline.seek(0);
    let destroyed = false;
    const instance = {
      timeline, duration: t(3), element: root,
      destroy() { if (destroyed) return; destroyed = true; timeline.kill(); root.remove(); if (instances.get(container) === instance) instances.delete(container); }
    };
    instances.set(container, instance);
    return instance;
  }
  global.TypeMotion = Object.freeze({ mount, presets });
})(window);

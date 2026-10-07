/* CameraMotion — three reusable, seekable 2D camera moves.
 * Adapted from HyperFrames yt-camera-move's wrapper + scale/translation recipe.
 * Local GSAP 3 + camera-motion.css required. No timers or runtime network calls.
 * Timeline controls spatial framing only; video playback belongs to the caller.
 */
(function (global) {
  'use strict';
  const pose = (scale, xPercent = 0, yPercent = 0) => Object.freeze({ scale, xPercent, yPercent });
  const presets = Object.freeze({
    'zoom-bottom-right': Object.freeze({
      label: '右下角放大缓', duration: 2.167, ease: 'power2.inOut',
      from: pose(1), to: pose(1.9, -45, -12)
    }),
    'zoom-out': Object.freeze({
      label: '缩小', duration: 1.67, ease: 'power3.out',
      from: pose(1.6), to: pose(1)
    }),
    'drift-up': Object.freeze({
      label: '缓慢向上', duration: 2, ease: 'sine.out',
      from: pose(1.24), to: pose(1.24, 0, -12)
    })
  });
  const instances = new WeakMap();
  let cloneSequence = 0;
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  function number(value, fallback, min, max, label) {
    const result = value === undefined ? fallback : Number(value);
    if (!Number.isFinite(result) || result < min || result > max) {
      throw new RangeError(label + ' must be a finite number between ' + min + ' and ' + max);
    }
    return result;
  }
  /** Pure configuration resolver, also useful for editors and validation. */
  function resolveOptions(options = {}) {
    const preset = options.preset === undefined ? 'zoom-bottom-right' : options.preset;
    if (!own(presets, preset)) throw new RangeError('Unknown camera preset: ' + preset);
    const base = presets[preset];
    const duration = number(options.duration, base.duration, .05, 300, 'duration');
    const intensity = number(options.intensity, 1, 0, 2, 'intensity');
    const ease = options.ease === undefined ? base.ease : options.ease;
    // Monotone easing keeps endpoint-derived cover protection valid at every frame.
    if (typeof ease !== 'string' || !/^(none|linear|(?:power[1-4]|sine|expo|circ)\.(?:in|out|inOut))$/.test(ease)) {
      throw new RangeError('ease must be none, linear, or power1–4/sine/expo/circ .in/.out/.inOut');
    }
    const fit = options.fit === undefined ? 'cover' : options.fit;
    if (fit !== 'cover' && fit !== 'contain' && fit !== 'fill') throw new RangeError('fit must be cover, contain, or fill');
    const contentMode = options.contentMode === undefined ? 'clone' : options.contentMode;
    if (contentMode !== 'clone' && contentMode !== 'move') throw new RangeError('contentMode must be clone or move');
    const preventGaps = options.preventGaps !== false;
    function resolvePose(which) {
      const basePose = base[which];
      const override = options[which] || {};
      const result = {
        scale: number(override.scale, 1 + (basePose.scale - 1) * intensity, .05, 20, which + '.scale'),
        xPercent: number(override.xPercent, basePose.xPercent * intensity, -500, 500, which + '.xPercent'),
        yPercent: number(override.yPercent, basePose.yPercent * intensity, -500, 500, which + '.yPercent')
      };
      // With center-origin uniform scale, this bound covers all four viewport
      // edges. Same eased progress for scale and translation covers the segment.
      if (preventGaps) result.scale = Math.max(result.scale, 1 + 2 * Math.max(Math.abs(result.xPercent), Math.abs(result.yPercent)) / 100);
      return Object.freeze(result);
    }
    return Object.freeze({ preset, duration, intensity, ease, fit, contentMode, preventGaps, from: resolvePose('from'), to: resolvePose('to') });
  }
  // Clones get unique IDs; common local SVG, label and accessibility references
  // are remapped. Style reusable DOM with classes, not page-global ID selectors.
  function cloneContent(source) {
    const clone = source.cloneNode(true);
    const prefix = 'cm-clone-' + (++cloneSequence) + '-';
    const idMap = new Map();
    const elements = [clone, ...clone.querySelectorAll('*')];
    elements.forEach(el => { if (el.id) { const old = el.id; const replacement = prefix + old; idMap.set(old, replacement); el.id = replacement; } });
    const idLists = new Set(['for', 'aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns', 'aria-activedescendant', 'headers']);
    elements.forEach(el => {
      for (const attribute of Array.from(el.attributes)) {
        if (attribute.name === 'id') continue;
        let value = attribute.value;
        if (idLists.has(attribute.name)) value = value.split(/\s+/).map(id => idMap.get(id) || id).join(' ');
        if ((attribute.name === 'href' || attribute.name === 'xlink:href') && value.startsWith('#')) value = '#' + (idMap.get(value.slice(1)) || value.slice(1));
        value = value.replace(/url\((['"]?)#([^)'"\s]+)\1\)/g, (match, quote, id) => idMap.has(id) ? 'url(' + quote + '#' + idMap.get(id) + quote + ')' : match);
        if (value !== attribute.value) el.setAttribute(attribute.name, value);
      }
      // Spatial mounting never starts video/audio playback as a side effect.
      if (el.tagName === 'VIDEO' || el.tagName === 'AUDIO') el.removeAttribute('autoplay');
    });
    return clone;
  }
  function mount(container, options = {}) {
    if (!container || container.nodeType !== 1) throw new TypeError('CameraMotion.mount requires a DOM container');
    if (!global.gsap) throw new Error('Load vendor/gsap.min.js before camera-motion.js');
    const settings = resolveOptions(options);
    const supplied = options.content;
    const hasContent = supplied !== undefined && supplied !== null;
    const hasSrc = options.src !== undefined && options.src !== null && options.src !== '';
    if (hasContent && hasSrc) throw new TypeError('Pass content OR src, not both');
    if (!hasContent && !hasSrc) throw new TypeError('Pass a DOM element as content, or an image/video src');
    if (hasContent && (!supplied || supplied.nodeType !== 1)) throw new TypeError('content must be a DOM Element');
    if (hasContent && (supplied === container || supplied.contains(container))) throw new TypeError('content must not contain the mount container');
    const mediaType = options.mediaType === undefined ? 'image' : options.mediaType;
    if (hasSrc && mediaType !== 'image' && mediaType !== 'video') throw new RangeError('mediaType must be image or video');
    if (instances.has(container)) instances.get(container).destroy();
    const document = container.ownerDocument;
    const root = document.createElement('div');
    root.className = 'cm-viewport';
    root.dataset.cameraPreset = settings.preset;
    root.style.setProperty('--cm-fit', settings.fit);
    root.style.setProperty('--cm-background', options.background || 'transparent');
    const layer = document.createElement('div');
    layer.className = 'cm-layer';
    const contentBox = document.createElement('div');
    contentBox.className = 'cm-content';
    let content, placeholder = null;
    if (hasContent) {
      if (settings.contentMode === 'clone') content = cloneContent(supplied);
      else {
        content = supplied;
        if (content.parentNode) {
          placeholder = document.createComment('CameraMotion original content position');
          content.parentNode.insertBefore(placeholder, content);
        }
      }
    } else {
      content = document.createElement(mediaType === 'video' ? 'video' : 'img');
      content.className = 'cm-media';
      if (mediaType === 'image') content.alt = String(options.alt || '');
      else { content.playsInline = true; content.preload = 'metadata'; }
      content.src = String(options.src);
    }
    contentBox.append(content); layer.append(contentBox); root.append(layer); container.append(root);
    const media = /^(IMG|VIDEO|AUDIO)$/.test(content.tagName) ? content : content.querySelector('img,video,audio');
    const timeline = global.gsap.timeline({ paused: true });
    // One tween owns every transform channel. Explicit endpoints make random
    // access and reverse seeking deterministic without callbacks or observers.
    timeline.fromTo(layer,
      { ...settings.from, transformOrigin: '50% 50%' },
      { ...settings.to, duration: settings.duration, ease: settings.ease }, 0);
    timeline.seek(0);
    let destroyed = false;
    const instance = {
      timeline, duration: settings.duration, element: root, layer, content, media, settings,
      destroy() {
        if (destroyed) return;
        destroyed = true;
        timeline.kill();
        if (hasContent && settings.contentMode === 'move') {
          if (placeholder && placeholder.parentNode) placeholder.replaceWith(content);
          else content.remove(); // Originally detached, or its old parent was removed.
        } else {
          [content, ...content.querySelectorAll('video,audio')].forEach(el => {
            if (el.tagName === 'VIDEO' || el.tagName === 'AUDIO') el.pause();
          });
        }
        root.remove();
        if (instances.get(container) === instance) instances.delete(container);
      }
    };
    instances.set(container, instance);
    return instance;
  }
  global.CameraMotion = Object.freeze({ mount, presets, resolveOptions });
})(window);

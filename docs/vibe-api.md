# VibeMotion 网页组件

脚本方式加载 `vendor/gsap.min.js`、`lib/vibe-motion.js` 和 `lib/vibe-motion.css`，或者从 `lib/index.mjs` 导入 VibeMotion。

```js
const shot = VibeMotion.mount(container, {
  preset: 'vibe-card', // card-sway / chip-drift / progress-fill
  title: '让灵感动起来', subtitle: '从一个小想法，到值得分享的作品。',
  badge: 'VIBE MOTION', duration: 3, intensity: 1, speed: 1, dark: false
});
shot.timeline.play();
// pause(), restart(), seek(seconds), progress(0..1)
// 卸载时 shot.destroy()
```

返回 `{timeline, duration, element, destroy}`。默认暂停，多实例独立，同容器重新挂载清理旧实例。文本以 textContent 写入。

- duration：0.1–60 秒；网页范围为 0.5–30 秒。
- intensity：0–2，控制旋转和位移幅度。
- speed：0–2，控制正弦运动频率，不影响时间轴长度。
- 卡片角度：sin(progress × 2π × speed × 0.8) × 12 × intensity。
- 标签位移：sin(progress × 2π × speed × 1.6) × 24 × intensity 像素。
- 进度：max(8, progress × 100)%；起始即有 8%，与源示例一致。

原示例不是首尾无缝循环；重播会回到起点。网页版重写了布局与播放接口，移除 Claude 标志，用通用符号代替。源码脚手架包含原始示例，可通过网页顶部下载。

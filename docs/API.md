# 接口文档

## 镜头组件 CameraMotion

完整参数、曲线与边界行为见 [camera-api.md](camera-api.md)。

```js
const shot = CameraMotion.mount(container, {
  preset: 'zoom-bottom-right',
  content: yourElement, // 或 src: './photo.jpg'
  duration: 2.167,
  intensity: 1,
  ease: 'power2.inOut',
  fit: 'cover'
});
```

| 预设 | 默认时长 | 起点 → 终点 | 默认缓动 |
| --- | --- | --- | --- |
| zoom-bottom-right | 2.167s | scale 1 → 1.9，x 0 → -45%，y 0 → -12% | power2.inOut |
| zoom-out | 1.67s | scale 1.6 → 1 | power3.out |
| drift-up | 2s | scale 1.24，y 0 → -12% | sine.out |

“移向右下角”指镜头的观察方向，所以内容往左上移动。`preventGaps` 默认 true，自动增加所需缩放保证图层覆盖画框；`fit: 'contain'` 下素材自身可能有留白。时长范围 0.05–300s，intensity 为 0–2。自定义 `from`/`to` 可覆盖 scale/xPercent/yPercent。

返回 `timeline,duration,element,layer,content,media,settings,destroy`。`resolveOptions(options)` 可获取规范化配置。视频播放需要调用者自行管理。

## 文字组件 TypeMotion

```js
const text = TypeMotion.mount(container, {
  preset: 'left-bounce',
  title: '灵感\n向左',
  subtitle: '任意文案均可替换',
  fontSize: 64,
  speed: 1,
  color: '#171717',
  accent: '#e62919'
});
```

| 参数 | 默认 / 范围 | 说明 |
| --- | --- | --- |
| preset | left-bounce / right-bounce / blur-up | 文字预设 |
| title | 原始预设标题 | 英文按词、中文按字，支持 \n |
| subtitle | 原始预设副标题 | grapheme 逐字输入，支持 emoji |
| fontSize | 72，16–240px | 标题字号，字幕为其 34% |
| speed | 1，0.25–4 | 时长为 3 / speed 秒 |
| color | #111111 | 文字颜色 |
| accent | #e62919 | 光标颜色 |

返回 `timeline,duration,element,destroy`。

## 通用控制

```js
shot.timeline.play();
shot.timeline.pause();
shot.timeline.restart();
shot.timeline.seek(1.2);
shot.timeline.progress(1); // 可用于 prefers-reduced-motion
shot.destroy();
```

所有时间轴默认 paused，正向和反向 seek 均确定；组件没有内置循环或依赖时钟的动画。同容器再次 mount 会清理旧实例。独立多实例无需唯一的全局选择器。

ES Module 入口 `lib/index.mjs` 需要浏览器环境。React 在 useEffect/useLayoutEffect，Vue 在 onMounted 中挂载，卸载时调用 destroy。样式保持 class 作用域，镜头内容默认 clone；DOM 中的事件监听器不会被克隆。如要保持交互可用 contentMode:'move'。

## 扩展新镜头

现有相机预设可以通过 from/to 参数扩展，不需要修改核心：

```js
CameraMotion.mount(container, {
  preset:'zoom-out', content: element, duration:3,
  from:{scale:1.5,xPercent:0,yPercent:0},
  to:{scale:1.5,xPercent:15,yPercent:-5},
  ease:'sine.inOut'
});
```

把新条目加入 `app.js` 的 shots 数组可扩充网页。发布前检查媒体加载、正反 seek、移动端和组件包同步。

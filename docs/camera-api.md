# CameraMotion：可复用镜头代码

这是 3 套空间变换预设，适用于任意 DOM 场景、图片或视频。库不包含原片人物、品牌、圆环、柱状图和字幕，也不控制内容内部的出现顺序。原视频只能提供运动参考；下面的数值是基于采样帧人工拟合，并非恢复原工程关键帧。

## 引入

```html
<link rel="stylesheet" href="lib/camera-motion.css">
<div id="camera" style="width:360px; aspect-ratio:9/16"></div>
<script src="vendor/gsap.min.js"></script>
<script src="lib/camera-motion.js"></script>
<script>
  const shot = CameraMotion.mount(document.querySelector('#camera'), {
    preset: 'zoom-bottom-right',
    src: 'assets/your-image.jpg',
    mediaType: 'image'
  });
  shot.timeline.play();
</script>
```

无需构建步骤或 CDN。容器必须有确定尺寸，建议设置 `aspect-ratio` 或 `height`；同样支持横屏和方形。镜头使用相对于容器的百分比移动。库创建的 viewport 占满容器，并裁切超出的画面。

## 三个预设的拆解

| `preset` | 默认时长 | 起点 | 终点 | 默认缓动 |
| --- | --- | --- | --- | --- |
| `zoom-bottom-right` | 2.167 秒 | `scale:1, xPercent:0, yPercent:0` | `scale:1.9, xPercent:-45, yPercent:-12` | `power2.inOut` |
| `zoom-out` | 1.67 秒 | `scale:1.6, xPercent:0, yPercent:0` | `scale:1, xPercent:0, yPercent:0` | `power3.out` |
| `drift-up` | 2 秒 | `scale:1.24, xPercent:0, yPercent:0` | `scale:1.24, xPercent:0, yPercent:-12` | `sine.out` |

- **右下角放大缓**：镜头看向原画面的右下方，画面本身向左上方移动并放大。原片右下的小圆逐渐进入视觉中心；组件只负责对应的镜头运动。
- **缩小**：从局部近景平滑退回全景。原片人物组合、字幕各自也有动画，这些内容动画不属于镜头组件。
- **缓慢向上**：整个画面向上漂移约容器高度的 12%。固定的 1.24 倍缩放用于给图片/视频留出裁切余量，因此移动后底部不会露出未覆盖区域。需要原尺寸 DOM 排版可传 `from:{scale:1}, to:{scale:1}, preventGaps:false`，由自己的延展背景填充边界。

三个预设复用了 HyperFrames registry `yt-camera-move` 的“在独立包裹层同时进行缩放和移动”结构；改为百分比定位、显式 from/to、独立 paused timeline，并加入可恢复 DOM 挂载与边界保护。没有复制示例中的 3D 倾斜、边缘模糊和场景内容。

## 参数

`CameraMotion.mount(container, options)`：

| 参数 | 默认值 | 含义 |
| --- | --- | --- |
| `preset` | `zoom-bottom-right` | 上表三个标识之一；非法标识会抛错 |
| `content` | 无 | 要展示的 DOM Element；与 `src` 二选一 |
| `src` | 无 | 图片或视频 URL / 相对路径；与 `content` 二选一 |
| `mediaType` | `image` | `image` 或 `video`；仅在传 `src` 时使用 |
| `duration` | 预设时长 | 动画秒数，允许 0.05–300 |
| `intensity` | `1` | 强度 0–2；0 为静止，1 为参考默认值；缩放偏离 1 的量与平移量等比例变化 |
| `ease` | 预设缓动 | `none`、`linear`，或 `power1`–`power4` / `sine` / `expo` / `circ` 加 `.in` / `.out` / `.inOut` |
| `fit` | `cover` | 图片/视频 `object-fit`，可选 `cover` / `contain` / `fill` |
| `background` | `transparent` | viewport 背景，支持 CSS 颜色 |
| `alt` | 空字符串 | `src` 创建图片时的替代文本 |
| `contentMode` | `clone` | `clone` 深拷贝；`move` 挂载原节点并在销毁时恢复 |
| `from` / `to` | 预设计算值 | `{scale, xPercent, yPercent}` 的部分覆盖对象；显式数值优先于 intensity |
| `preventGaps` | `true` | 根据平移量自动提高缩放值，使运动层始终覆盖 viewport；需要小于 1 的缩放时须关闭 |

`fit:cover` 会裁切媒体边缘；`contain` 会保留整张图并可能显示背景边带，`fill` 会拉伸。边界保护保证的是**运动层覆盖视口**；透明图片、DOM 自身空白和 `contain` 产生的边带仍保留，库不会伪造或延展素材。自定义缓动不支持会越过终点的 `back` / `elastic`，确保边界推导在整段运动中成立。

`from/to` 支持 `scale` 0.05–20、`xPercent/yPercent` -500–500。边界保护可能把设置的 scale 提高到覆盖视口所需的值；`instance.settings` 是最终使用的有效值。`CameraMotion.resolveOptions(options)` 是不访问 DOM 的纯函数，可提前查看有效参数或验证编辑器输入。

## 返回值与控制

```js
const shot = CameraMotion.mount(host, { preset: 'zoom-out', content: scene });
shot.timeline.play();                  // 开始
shot.timeline.pause();                 // 暂停
shot.timeline.seek(0.8);               // 跳到第 0.8 秒
shot.timeline.seek(shot.duration);     // 定型画面
shot.timeline.reverse();               // 反向播放
shot.timeline.restart();               // 重新播放
shot.timeline.timeScale(0.5);          // 由调用方控制播放速度
shot.destroy();                        // 停止动画，移除自建包裹层
```

| 返回字段 | 内容 |
| --- | --- |
| `timeline` | 默认暂停的 GSAP timeline；不会自动播放或循环 |
| `duration` | 这段 timeline 的标称秒数；调用 `timeScale()` 不会改此值 |
| `element` | 创建的 viewport |
| `layer` | 被 GSAP 操作的空间变换层 |
| `content` | 实际挂载的节点（默认是传入节点的拷贝） |
| `media` | 根媒体元素或内容中的第一个 `img/video/audio`，没有则 `null` |
| `settings` | 归一化后的有效参数，含 from/to |
| `destroy()` | 可重复调用；释放 timeline，并只移除该实例创建的 DOM |

同一容器再次调用 `mount` 自动销毁旧实例，可用于参数更新。不同容器的实例互不影响。容器推荐为空的专用宿主；库不会删除容器内无关内容。不要把旧实例的 `content` 作为同容器下一次的输入，应该保存并复用自己的原始 `scene` 节点。

## 使用自己的 DOM

```js
const scene = document.createElement('section');
scene.className = 'my-scene';
const title = document.createElement('h2');
title.textContent = '你的标题';
scene.append(title);
const shot = CameraMotion.mount(host, {
  preset: 'drift-up',
  content: scene,
  duration: 4,
  intensity: 0.6
});
```

默认 `clone` 不移动、不修改原节点。`cloneNode(true)` 会复制元素结构和属性，但不会复制 `addEventListener` 监听器、Canvas 像素、Shadow DOM 或正在播放的媒体状态。克隆 ID 会加唯一前缀，常见 SVG URL、标签及 ARIA 引用同步重映射；复用场景请用 **class** 编写样式，依赖页面全局 `#id` 的 CSS 选择器不会自动改写。克隆媒体的 autoplay 属性会去除。

需要保留交互监听器、Canvas 等状态时，传 `contentMode:'move'`：

```js
const scene = document.querySelector('.interactive-scene');
const shot = CameraMotion.mount(host, {
  content: scene,
  contentMode: 'move',
  preset: 'zoom-out'
});
// 原位置会留下轻量占位注释。销毁恢复原节点及其事件监听器。
shot.destroy();
```

原本未插入 DOM 的节点在销毁后恢复为未挂载状态；原位置的占位符已被外部代码移除时也会解除挂载，避免留下异常包裹层。移动模式不改变、暂停或重置已有视频播放状态。内容根元素默认填满视口，内部排版由调用方负责；独立内层的 CSS transform 不会被镜头改写。

## 图片与视频

```js
const shot = CameraMotion.mount(host, {
  preset: 'zoom-bottom-right',
  src: 'assets/clip.mp4',
  mediaType: 'video',
  duration: 2.167,
  fit: 'cover'
});
shot.media.muted = true;
// 由用户触发或遵循浏览器自动播放策略，调用方负责处理拒绝。
playButton.addEventListener('click', async () => {
  await shot.media.play();
  shot.timeline.restart();
});
```

镜头 `seek()` 不等同于视频 `currentTime`，也不会解码或同步视频帧。需要逐帧导出或严格视音频同步时，由宿主渲染器统一设置媒体时间。库创建/克隆的媒体会在 `destroy()` 暂停；`move` 模式中的原媒体不被暂停。

## 接入自己的主时间线

```js
const shot = CameraMotion.mount(host, { preset:'zoom-out', content:scene });
const master = gsap.timeline({ paused:true });
shot.timeline.paused(false);
master.add(shot.timeline, 1.5);
master.seek(2);
```

加入主时间线前必须解除子时间线的 paused 状态。用于 HyperFrames 时，把 `master` 注册到与 `data-composition-id` 同名的 `window.__timelines`，由宿主负责媒体时间与片段生命周期。独立组件本身不要求 HyperFrames。

# Motion Library · 可复用动效镜头库

[打开在线预览](https://tyler9169.github.io/motion-shot-library/) · [多实例示例](https://tyler9169.github.io/motion-shot-library/examples/) · [接口文档](docs/API.md)

19 个 HTML / CSS / GSAP 动效预设。网页里可以预览、慢放、拖动时间轴、调参数、替换素材，以及复制接入代码。无需 HyperFrames，无需后端，所有依赖随仓库提供。

| 类型 | 预设 | 动作 |
| --- | --- | --- |
| 镜头 | `zoom-bottom-right` | 缓慢放大，将焦点移向右下角 |
| 镜头 | `zoom-out` | 从近景缩小到完整画面 |
| 镜头 | `drift-up` | 整体缓慢上移 |
| 文字 | `left-bounce` | 向左遮罩入场 + 回弹 + 打字 |
| 文字 | `right-bounce` | 分词向右弹入 + 打字 |
| 文字 | `blur-up` | 模糊上移至清晰 + 打字 |

这些参数按视频参考人工拟合，并非从原剪辑工程自动提取。组件实现可复用的空间与文字运动，不包含原片照片、品牌图形、额外字幕或剪辑转场。网页中的图表是独立演示场景。

## 图片 / 视频镜头

复制 `lib/`、`vendor/` 到你的项目中：

```html
<link rel="stylesheet" href="lib/camera-motion.css">
<div id="shot" style="width:100%;height:400px"></div>
<script src="vendor/gsap.min.js"></script>
<script src="lib/camera-motion.js"></script>
<script>
const shot = CameraMotion.mount(document.querySelector('#shot'), {
  preset: 'zoom-out',
  src: './your-image.jpg',
  mediaType: 'image',
  duration: 2,
  intensity: 1,
  fit: 'cover'
});
shot.timeline.play();
</script>
```

传入 `content: yourElement` 可用于整个网页元素。默认克隆元素，保留原内容；需要保留事件监听器时传 `contentMode: 'move'`，卸载会恢复原位置。不要同时传 `src` 和 `content`。

视频设置 `mediaType: 'video'`。组件仅驱动画面的空间变换，视频的播放由调用者控制，例如用户点击播放后执行 `shot.media.play()`。

## 文字动效

```html
<link rel="stylesheet" href="lib/type-motion.css">
<div id="title"></div>
<script src="vendor/gsap.min.js"></script>
<script src="lib/type-motion.js"></script>
<script>
const title = TypeMotion.mount(document.querySelector('#title'), {
  preset: 'blur-up',
  title: '慢慢清晰',
  subtitle: '从模糊想法，到清晰表达。',
  fontSize: 64,
  speed: 1,
  color: '#171717',
  accent: '#e62919'
});
title.timeline.play();
</script>
```

英文标题按词、中文按字，副标题按 Unicode grapheme 逐字输入。通过 `\n` 换行。输入使用 `textContent`，不解析 HTML。

## ES Module

```js
import { CameraMotion, TypeMotion } from './lib/index.mjs';
```

需用 HTTP 服务访问。`examples/index.html` 是完整的多实例演示。SSR 框架请在浏览器挂载生命周期调用；组件卸载时调用 `destroy()`。

## 播放控制

各类组件均返回 `{ timeline, duration, element, destroy }`。`timeline` 默认暂停：

```js
shot.timeline.play();
shot.timeline.pause();
shot.timeline.restart();
shot.timeline.seek(1.2);
shot.timeline.progress(0.5);
shot.destroy();
```

同一容器再次 `mount()` 会自动销毁旧实例。每个实例独立，不互相影响。组件不强制循环；预览网页中的循环只属于播放器。

## 本地运行

```sh
python3 -m http.server 4188 --bind 127.0.0.1
```

打开 `http://127.0.0.1:4188/`。不需要安装依赖或构建。`npm run check` 检查 JavaScript 语法。

## 目录

```text
index.html / style.css / app.js  可视化镜头网页
lib/                            可复用组件与模块入口
vendor/                         本地 GSAP 依赖
examples/                       多实例接入示例
docs/                           API 与动作拆解
downloads/                      可直接下载的组件包
```

替换素材使用浏览器本地 Blob URL，文件不上传到服务器。示例在访客偏好减少动画时显示最终状态，点击播放可主动体验。

## 发布

GitHub Pages 从 `main` 分支的根目录发布。修改网页或组件后提交到 `main`，Pages 自动更新。发布前同步重新生成 `downloads/motion-shot-library.zip`（见 `scripts/package.py`）。

## 许可与来源

本仓库原创组件、网页与文档采用 [MIT License](LICENSE)。GSAP 3.15.0 保留其原许可，详见 [第三方说明](THIRD_PARTY.md)。空间包装与文字分段模式参考 HyperFrames registry 的 `yt-camera-move`、`text-stagger`、`soft-blur-in`；时间、方向、遮罩及可复用接口按本项目需求实现。

## 新增 Vibe Motion 与外部镜头目录

- Vibe Motion：1 个完整卡片场景 + 3 个独立动作；[接口说明](docs/vibe-api.md)。
- [全部分类与命名](docs/catalog.md)，网页支持分类与搜索。
- [XCYJ 参考目录](references.html)：257 条外部参考、13 类。仅提供整理索引和原站入口，尚无可编辑组件源码。
- [Vibe Motion 源项目快照](downloads/create-vibe-motion-source.zip)：上游 commit `2657ae9abadb89714bdabf0d3aef210e60ce1223`，保留目录结构和源码；不包含 node_modules。解压后执行 `pnpm install`，使用 `pnpm dev` 启动。

## StoryMotion 视频参考组

新增 9 个可替换图片与文案的场景组件。[打开九镜头总览](https://tyler9169.github.io/motion-shot-library/examples/story.html)，见 [九镜头拆解与 API](docs/story-api.md)。全部原创示意素材随 CSS 提供，原始 MOV 不在公开仓库内。

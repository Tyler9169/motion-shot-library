# 2026-10-13 · 十个镜头拆解

逐帧观察本地 MP4 后人工拟合的网页组件。原人物、品牌标志、音乐与视频文件保留在本机；公开示例使用原创 CSS 图形。缓动、运动模糊与消散为网页近似效果，未从剪辑工程提取参数。

| 原文件 | 名称 / ID | 时长 | 动作 |
|---|---|---|---|
| 内缩外放-1.mp4 | 文字内缩外放换词 / `text-contract-expand` | 2.067s | 模糊收拢 → 放大清晰 → 换词展开 |
| 向上弹出三个-1.mp4 | 三卡错峰向上弹出 / `triple-rise` | 10.367s | 中卡上弹 → 左卡上弹 → 右卡上弹 |
| 向右被文件夹吸走-1.mp4 | 文字向右吸入文件夹 / `folder-collect` | 4.5s | 双行出现 → 文件夹进入 → 文字收拢 → 收纳上移 |
| 图标向上弹-1.mp4 | 图标上弹与双标签展开 / `icon-rise-badges` | 6.533s | 图标上弹 → 名称展开 → 左右标签弹入 |
| 头像缩小左下-1.mp4 | 圆形头像缩至左下 / `avatar-circle-corner` | 1s | 全屏 → 圆形裁切 → 缩至左下 → 标题入场 |
| 左右弹出-1.mp4 | 左右卡片翻开弹入 / `side-card-reveal` | 1.133s | 右卡展开 → 左卡展开 → 轻弹落位 |
| 文字动效-1.mp4 | 大字分开与下方换标题 / `headline-split-swap` | 2.6s | 大字两侧揭示 → 淡出 → 下方标题弹入 |
| 文字掉下来-1.mp4 | 关键词错峰下落汇总 / `keywords-drop` | 2.554s | 右词下落 → 中词下落 → 左词下落 → 汇总标题 |
| 画面弹-1.mp4 | 图标切换与画面弹出 / `panel-pop` | 3.033s | 标题退场 → 图标弹入 → 大画面弹入 |
| 鼠标下拉页面-1.mp4 | 鼠标拉下页面并收拢 / `cursor-page-pull` | 1.967s | 鼠标抵达 → 页面下拉 → 图标排布 → 底部收拢 |

## 使用

```html
<link rel="stylesheet" href="lib/story-motion.css">
<div id="shot" style="width:100%;aspect-ratio:16/10"></div>
<script src="vendor/gsap.min.js"></script>
<script src="lib/story-motion.js"></script>
<script>
const shot = StoryMotion.mount(document.querySelector('#shot'), {
  preset: 'triple-rise',
  duration: 6,
  intensity: 1,
  title: '三个新方向',
  subtitle: '逐个介绍，整体呈现',
  items: [
    {label:'方向一',src:'./first.png'},
    {label:'方向二',src:'./second.png'},
    {label:'方向三',src:'./third.png'}
  ]
});
shot.timeline.play();
// pause() / restart() / seek(1) / progress(.5)
// 卸载时 shot.destroy()
</script>
```

所有新预设复用 StoryMotion 接口，时长 0.1–60s，运动幅度 0–2；零幅度减少位移，仍保留必要的入场与布局变化。文本通过 textContent 设置，图片在网页内本地预览。

## 内容对应

- `text-contract-expand`：title 是前一句，coverTitle 是后一句。
- `triple-rise`：items 的第 1 张在中间、第 2 张左侧、第 3 张右侧，按此顺序上弹。
- `folder-collect`：items 前两项为待收纳文字；coverTitle 是收纳后的提示。文件夹和鼠标为内置矢量/CSS 示意。
- `icon-rise-badges`：items 第 1 项为中心图标卡，第 2、3 项为左右圆形标签。
- `avatar-circle-corner`：subjectSrc 是头像图片，CSS 圆形裁切，不自动抠图。完整画面迅速裁圆后缩至左下，与 presenter-corner 的矩形小窗不同。
- `side-card-reveal`：items 第 1 张在右、第 2 张在左，依次从侧面翻开。
- `headline-split-swap`：title 是开场大字，coverTitle 是下方接续标题；字间距模拟两侧展开。
- `keywords-drop`：items 前三项的 label 分别在右、中、左下落，title 为最后的汇总句。
- `panel-pop`：coverTitle 为图标提示；items 第 1 张为后续大画面。subjectSrc 可替换左下人物。
- `cursor-page-pull`：items 前五项循环填充九张图标卡，先拉下页面，再聚合到下方。鼠标运动为预设演示，不监听真实用户滚动；可以通过 timeline.progress 驱动。

字幕和标题建议短句；长文案可缩短或在自己的 CSS 中调整字号。参考片的人物动态、真实视频内容、粒子散开与光照不包含在此二维动效组件内。

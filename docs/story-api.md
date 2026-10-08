# StoryMotion · 九个素材镜头拆解

本组按用户提供的 9 段 MOV 视频进行关键帧观察和动作拟合。只交付空间、文字和布局动画，不复用原片人物、照片、音乐、字幕内容或品牌素材。示意画面由 CSS 绘制。动作节奏并非原剪辑工程参数；径向模糊使用 CSS 模糊与缩放近似，标题消散使用擦除与模糊近似。

| 视频参考 | 命名 | 预设 ID | 默认时长 | 动作 |
|---|---|---|---|---|
| ohhhh-1.mov | 惊叹文字横向拉长 | `reaction-stretch` | 0.967s | 逐字延长 → 横向铺满 |
| 头像左下缩小-1.mov | 人物缩至左下角 | `presenter-corner` | 1.734s | 全屏人物 → 左下小窗 |
| 模糊放大弹出多张-1.mov | 多图模糊弹出 | `blur-collage` | 1.667s | 错峰放大 → 去模糊 → 拼贴 |
| 开头标题掉下-1.mov | 开场标题下落 | `headline-drop` | 2.738s | 双图弹入 → 标题下落 → 擦除 |
| 多种分别弹出-1.mov | 卡片依次展示聚合 | `cards-assemble` | 6.174s | 逐卡放大展示 → 缩入五卡布局 |
| 多张弹出文字-1.mov | 图表弹出叠加标题 | `evidence-pop` | 1.507s | 双图错峰 → 结论标题出现 |
| 多图弹出反转-1.mov | 双侧图片翻转替换 | `double-flip` | 2.167s | 左右弹入 → 翻面 → 第二组 |
| 标题封面-1.mov | 大字冲屏切换封面 | `cover-punch` | 3.234s | 大字入场 → 放大模糊 → 新封面 |
| 背景向上模糊缓动-1.mov | 背景上移模糊轮播 | `background-rise` | 4.134s | 背景依次上移 → 聚焦 → 淡出 |

## 使用

加载 `vendor/gsap.min.js`、`lib/story-motion.js`、`lib/story-motion.css`，或从 `lib/index.mjs` 导入 StoryMotion。

```js
const shot = StoryMotion.mount(container, {
  preset: 'blur-collage',
  duration: 1.667,
  intensity: 1,
  title: '四个新的视角',
  subtitle: '让每个画面都有位置',
  coverTitle: '打开新的视角',
  subjectSrc: './person.png',
  backgroundSrc: './background.jpg',
  items: [
    {label:'探索',src:'./01.jpg'},
    {label:'连接',src:'./02.jpg'},
    {label:'创造',src:'./03.jpg'},
    {label:'分享',src:'./04.jpg'},
    {label:'成长',src:'./05.jpg'}
  ]
});
shot.timeline.play();
// pause(), restart(), seek(seconds), progress(0..1)
// 卸载：shot.destroy()
```

容器应有尺寸，推荐 16:9。返回 `{timeline,duration,element,destroy}`，默认暂停。同容器重挂会销毁旧实例，独立实例互不干扰。所有状态按进度计算，反向 seek 不依赖之前的帧。

- `duration`：0.1–60 秒，整体缩放节奏。
- `intensity`：0–2，调节辅助位移、模糊、缩放强度；语义布局和入场不会被取消。
- `subjectSrc`：人物图，推荐带透明通道的 PNG/WebP；不会自动抠图。
- `backgroundSrc`：底层背景图，裁切铺满。
- `items`：按数组顺序取图和标签，缺图回退示意图。
- `blur-collage` 用 4 张；`headline-drop` 和 `evidence-pop` 用 2 张；`cards-assemble` 用 5 张；`double-flip` 用 4 张（左前、右前、左后、右后）；`background-rise` 用前 3 张作轮播背景。
- `title` 在惊叹、人物角落、标题下落、证据叠加、封面镜头中显示；其余镜头聚焦图片编排。`coverTitle` 仅用于 cover-punch。
- `background-rise` 终段淡回底层背景；`cover-punch` 终段进入新封面；这两种镜头与其余镜头均不保证首尾无缝循环。
- 网页上传的图片不上传服务器，复制代码会换成项目文件占位路径，接入时需自行放入文件。

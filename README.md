# vigill357.github.io
# 无限理想乡 · 创作宇宙

> 一个用于展示原创小说、衍生故事与世界观设定的静态网站，部署于 GitHub Pages。

---

## 项目简介

本仓库是 **「无限理想乡」创作宇宙** 的官方展示站点，包含主线小说目录、衍生故事卡片、插画图鉴与世界观数据库四大板块。网站为纯静态前端（HTML + CSS + JS），无需后端，所有内容数据通过本地 JSON / txt 文件驱动，在 GitHub Pages 上开箱即用。

---

## 文件结构

```
vigill357.github.io/
├── index.html               # 主页面（网站唯一 HTML 入口）
├── css/
│   └── main.css             # 全局样式表
├── js/
│   ├── app.js               # 主入口脚本
│   ├── cursor.js            # 几何光标模块
│   └── loader.js            # 内容加载模块
└── data/
    ├── world.json           # 全站内容数据源
    └── chapters/
        ├── ch1.txt          # 第一章正文
        └── ch2.txt          # 第二章正文
```

---

## 各文件详细说明

### `index.html` — 网站主页面

网站的唯一 HTML 入口，承载所有可见内容的结构与布局，共分为以下区域：

| 区域 | 说明 |
|------|------|
| 几何光标 | 由两个 SVG 组成的三脚架造型自定义光标，随鼠标移动 |
| 导航栏 `<nav>` | 固定顶部，包含站名、锚点链接、连载状态指示灯 |
| Hero 首屏 | 全屏封面，含标题、简介、快速入口按钮、实时统计信息面板 |
| §01 主线小说 | 展示主线长篇信息与最新章节列表 |
| §02 衍生故事 | 三列卡片式布局，展示各衍生短篇 |
| §03 插画图鉴 | 四列网格，展示角色/场景/概念插画占位框 |
| §04 世界观与设定 | 人物、地理、时间线、规则四个入口卡片 |
| 页脚 `<footer>` | 版权信息与最近更新日期 |

按依赖顺序引入三个 JS 脚本：`cursor.js` → `loader.js` → `app.js`。

---

### `css/main.css` — 全局样式表

共 13 个模块，统一管理全站视觉风格：

| 模块 | 内容 |
|------|------|
| 模块 1 · 全局颜色变量 | 使用 CSS 自定义属性（`--bg0` 至 `--text3`）定义深蓝色系配色方案，包含背景色、蓝色、青色、金色、文字色、边框色 |
| 模块 2 · 全局基础样式 | Reset、`scroll-behavior: smooth`、深色背景、网格纹理（`body::before`）、扫描线纹理（`body::after`）、自定义滚动条 |
| 模块 3 · 通用动画关键帧 | 定义 `fadeUp`、`fadeLeft`、`fadeIn`、`blink`、`breathe`、`scrollDown` 等复用动画 |
| 模块 4 · 几何光标 | 内部三脚架（即时跟随）与外部镂空三角环（延迟跟随）的定位与混合模式样式；悬停时旋转放大效果（`.big` 类） |
| 模块 5 · 点击波纹 | `.rpl` 类，点击时从鼠标位置向外扩散的圆形波纹动画 |
| 模块 6 · 导航栏 | 固定顶部毛玻璃导航；Logo 双行排版；链接下划线滑入动画；状态灯闪烁效果 |
| 模块 7 · 首屏 Hero | 全屏居中布局；三个发光气泡（`.orb`）呼吸动画；标题渐变色；按钮多边形裁切（`clip-path`）；Hero 信息面板入场动画；向下滚动提示箭头 |
| 模块 8 · 内容板块通用 | 所有 `<section>` 的统一内边距；节头（标签 + 分割线 + 编号）样式 |
| 模块 9 · 小说板块 | 左主右侧的两栏网格；小说主体 hover 变色；章节列表条目箭头滑动效果 |
| 模块 10 · 衍生故事板块 | 三列等宽卡片网格；卡片 hover 背景变化；元信息底部分隔布局 |
| 模块 11 · 插画图鉴板块 | 四列 2:3 纵向卡片；图框 hover 微缩放效果 |
| 模块 12 · 世界观板块 | 两列两行世界观入口卡片；数量统计区块样式 |
| 模块 13 · 页脚 | 三栏水平分布布局；半透明深色背景 |

---

### `js/cursor.js` — 几何光标模块

封装为 IIFE 模块 `Cursor`，对外暴露 `init()` 方法。主要功能：

- **即时跟随**：监听 `mousemove`，内部三脚架（`#cur`）直接跟随鼠标坐标。
- **延迟跟随**：通过 `requestAnimationFrame` 循环，以 0.15 的插值系数让外部三角环（`#cur-ring`）平滑滞后跟随，产生惯性拖尾效果。
- **悬停放大**：对 `a`、`button`、`.story-card` 等可交互元素绑定 `mouseenter/mouseleave`，切换外环 `.big` 类，触发 CSS 中旋转 60° + 放大 1.3 倍的动画。
- **点击波纹**：监听全局 `click` 事件，在点击坐标创建 `.rpl` 元素，0.65 秒后自动移除，实现点击扩散波纹。

---

### `js/loader.js` — 内容加载模块

封装为 IIFE 模块 `Loader`，对外暴露 `init()` 方法。负责从 `data/` 目录异步拉取数据并渲染到页面，包含三个核心函数：

| 函数 | 说明 |
|------|------|
| `loadChapterList()` | 读取 `data/world.json`，将 `chapters` 数组渲染为侧栏章节条目；绑定点击事件，触发 `openChapter()` |
| `openChapter(filePath, title)` | 读取对应 `.txt` 章节文件，目前以 `alert` 弹窗显示预览（预留扩展为阅读器弹窗/独立页面） |
| `loadWorldCards()` | 读取 `data/world.json` 中的 `world` 字段，将人物、地理、时间线、规则的数量填入世界观卡片 |
| `updateStats(data)` | 将 JSON 中的章节数、故事数、插画数、最近更新日期同步到 Hero 信息面板与小说统计栏 |

所有网络请求均包含 `try/catch`，失败时静默降级，保持 HTML 中的占位内容不变。

---

### `js/app.js` — 主入口脚本

在 `DOMContentLoaded` 事件后执行，负责：

1. **导航平滑滚动**：查找所有 `href` 以 `#` 开头的锚点链接，拦截默认跳转，改用 `scrollIntoView({ behavior: 'smooth' })` 平滑滚动。
2. **模块初始化调度**：依序调用 `Cursor.init()` 与 `Loader.init()`，启动光标系统与数据加载。

---

### `data/world.json` — 全站内容数据源

网站的核心数据文件，结构如下：

```jsonc
{
  "lastUpdate":  "最近更新日期（显示在 Hero 面板）",
  "totalWords":  "累计字数（显示在小说统计栏）",
  "chapters": [  // 主线章节列表，驱动侧栏目录
    { "label": "章节标题", "file": "章节文件路径", "date": "更新日期" }
  ],
  "stories": [   // 衍生故事元数据（供未来扩展）
    { "title": "故事名", "status": "状态", "words": "字数" }
  ],
  "gallery": [   // 插画元数据（供未来扩展）
    { "id": "唯一ID", "type": "类型", "label": "标题" }
  ],
  "world": {     // 世界观数量统计，填入四张卡片
    "characters":    0,
    "locations":     0,
    "timelineNodes": 0,
    "rules":         0
  }
}
```

**只需编辑此文件，即可同步更新 Hero 面板、章节目录、世界观统计数据，无需修改 HTML。**

---

### `data/chapters/ch1.txt` 和 `ch2.txt` — 章节正文文件

纯文本格式的章节内容，每个文件对应一章。文件路径在 `world.json` 的 `chapters[].file` 字段中声明，由 `loader.js` 的 `openChapter()` 函数按需异步加载。

支持中文全角缩进排版（`　　`），保存后刷新页面即可生效。

---

## 快速上手：更新内容

| 操作 | 做法 |
|------|------|
| 新增一章 | 在 `data/chapters/` 创建新 `.txt` 文件，并在 `world.json` 的 `chapters` 数组中添加对应条目 |
| 更新字数 / 日期 | 修改 `world.json` 中的 `totalWords` 和 `lastUpdate` |
| 更新世界观统计数量 | 修改 `world.json` 中的 `world.characters` / `locations` 等字段 |
| 修改站名/简介 | 直接编辑 `index.html` 中对应的文本节点 |
| 调整配色 | 修改 `css/main.css` 模块 1 中的 CSS 变量值 |

---

## 技术栈

- **纯原生前端**：HTML5 · CSS3 · Vanilla JavaScript（无框架、无构建工具）
- **字体**：Google Fonts（Noto Serif SC · Noto Sans SC · Share Tech Mono · Cinzel）
- **部署**：GitHub Pages（推送至 `main` 分支自动发布）

---

© 2026 · vigill357 · 保留所有权利

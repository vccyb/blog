# 博客视觉设计系统 v2.0

> **⚠️ 已废弃（2026-08-30）**：本规范描述的是旧主题（Astro Theme Yi / Tailwind + Josh 蓝改版）的视觉系统。站点已整站切换到 astro-antfustyle-theme（antfu 极简风），本文仅存档，不再反映当前站点实现。现行样式以主题默认 + `src/styles/your.css` 为准。

> 风格定位：**joshuakgoldberg.com 全面对标（§8 备选 C 转正）**——Josh 原味蓝系单色板 + 纯排版布局 + League Spartan 单一字族；二次元可爱元素保留在内容层（吉祥物贴纸、读完啦），退出色板层。
> 一句话：页面 95% 是藏蓝×白的克制排版，强调蓝只给链接/激活态，可爱感交给吉祥物和微动效，不再靠颜色。

### v2.0 变更（2026-08-30，用户拍板「整体尽可能参考 Josh」）

1. **色板整体切 Josh 蓝**（原 §8 备选 C，且樱粉全部退出）：强调 `#1170d0`/`#77bbff`，正文 `#283556`/`#dae7f3`，底 `#feffff`/`#111117`，顶部光晕 `#fdffff`/`#071428`，subtle `#d7e9ef`/`#052438`，meta 中蓝灰 `#789dc7`（双主题同值）。下方 §2 的竹绿/樱粉 token 值已全部被替换（变量名保留兼容）。
2. **贴纸阴影回归 Josh 本义**：`text/drop-shadow 3px 3px 1px var(--color-subtle)`（淡蓝非粉）；头像用弥散式 `box-shadow: 0 3px 7px 3px subtle`（`.avatar-glow`）。
3. **布局 Josh 化**：首页去侧栏单栏居中（IndexPage `sidebar={false}`），Hero 改左右布局（左大圆头像/右 `Hi! I'm xxx.` 特大标题 + 社交行带文字 + boop hover 动画）；置顶/列表去卡片壳纯排版；侧栏 Profile/Toc 去 shadow 卡片壳；文章 meta 行 pill → 纯文本（`#tag` + squiggly hover 波浪下划线）。
4. **字体统一**：全站单一字族 League Spartan（§3 方案 1 的 Inter 正文弃用），中文回退 Noto Sans SC；FontSwitcher 文楷保留。
5. **代码块透明背景**（Josh `--astro-code-color-background: transparent`），主题保持 vitesse-light/dark；github-markdown.css 的 fg/accent 色换成 Josh 藏蓝/强调蓝。
6. **Header**：`bg-skin-fill/85 + backdrop-blur-md`；激活导航 emphasized + drop-shadow subtle（Josh 原样）。
7. **新增组件类**：`.squiggly`（hover 波浪下划线）、`.animate-boop`（Josh boop 弹性晃动，prefers-reduced-motion 守卫）、`.avatar-glow`。
8. **OG 卡同步蓝系**：偏移阴影 `#d7e9ef`、标题 `#142842`、meta 纯文本（分类强调蓝 / `#tag` 中蓝灰），无 pill。

---

## 以下为 v1.1 存档（竹绿 × 樱粉方案，已被 v2.0 取代，仅作历史参考）

> 风格定位：**antfu 式极简骨架（竹绿）× Josh Goldberg 式贴纸质感（偏移阴影、蓝灰调）× 二次元可爱点缀（樱粉）**
> 一句话：页面 95% 是克制的灰绿基底，可爱感集中爆发在 5% 的细节里；用"贴纸感偏移阴影"替代模糊投影，可爱但不幼稚。

### v1.1 变更：融合 joshuakgoldberg.com

实测他站点的 CSS token 后，吸收了三样东西：

1. **3px 3px 1px 无模糊实心偏移阴影**（他的 h1、激活导航、圆形头像全在用）——这是"贴纸/漫画"质感的来源，和二次元天然兼容。我们的阴影色用樱粉，等于每处阴影都是一个可爱细节。
2. **藏蓝灰正文 + 带色黑**：他的正文是 `#283556`（藏蓝灰）而非纯中性灰，深色底是 `#111117`（夜蓝黑）而非纯黑——颜色永远带一点色调，页面就"软"。
3. **页面顶部径向光晕 + 超大 h1（行高 0.85）**：首屏氛围感的关键，我们换成淡绿光晕。

他的字体是 League Spartan Variable（几何圆润可变字体），仅对英文数字生效，标题的英文/数字部分引入使用。

## 1. 设计原则（70 / 25 / 5）

| 层次 | 占比 | 职责 | 颜色 |
|------|------|------|------|
| 基底 | ~70% | 阅读体验，保持中性、低饱和 | 浅灰底 / 白卡片 / 深灰正文 |
| 主强调 | ~25% | 链接、标题 hover、选中态、logo | 竹绿（antfu Vitesse 同源） |
| 点缀 | ~5% | 标签、吉祥物、粉色细节 | 樱花粉（二次元可爱感） |

核心心法：**绿色管"专业好看"，粉色管"可爱"，互不越界。** 正文永远不用粉色，粉色只出现在 tag、贴纸、装饰位，这样可爱不会稀释可读性。

## 2. 色彩系统

### 2.1 映射到现有 CSS 变量（src/styles/index.css）

直接替换 `:root` 与 `html[data-theme]` 两个块：

```css
@layer base {
  :root,
  html[data-theme="light"] {
    --color-fill: 253, 255, 254;          /* #fdfffe 近白微绿底（Josh 同思路：底色带一丝色调） */
    --color-fill-secondary: 255, 255, 255; /* #ffffff 卡片 */
    --color-card: 255, 255, 255;
    --color-text: 40, 53, 86;             /* #283556 藏蓝灰正文（Josh 同款，比纯灰柔和） */
    --color-text-active: 0, 168, 126;     /* #00a87e 竹绿主强调 */
    --color-border: 224, 232, 230;        /* #e0e8e6 细边框（微绿调） */
    --color-border-active: 0, 168, 126;
    --color-modal: 27, 27, 30;
  }

  html[data-theme="dark"] {
    --color-fill: 15, 21, 18;             /* #0f1512 墨绿黑（学 Josh 的"带色黑"） */
    --color-fill-secondary: 22, 28, 25;   /* #161c19 卡片 */
    --color-card: 22, 28, 25;
    --color-text: 220, 232, 226;          /* #dce8e2 月光白（微绿） */
    --color-text-active: 61, 220, 151;    /* #3ddc97 暗色竹绿（Vitesse dark 同源） */
    --color-border: 42, 50, 46;           /* #2a322e */
    --color-border-active: 61, 220, 151;
    --color-modal: 251, 251, 251;
  }
}
```

### 2.2 新增点缀色 token（加在同一个 @layer base 里）

```css
:root,
html[data-theme="light"] {
  --color-accent-pink: 214, 72, 127;       /* #d6487f 樱粉文字用（对比度达标） */
  --color-accent-pink-bg: 255, 228, 238;   /* #ffe4ee 樱粉浅底 */
  --color-accent-green-bg: 231, 248, 241;  /* #e7f8f1 竹绿浅底 */
  --shadow-sticker: 3px 3px 1px #ffd6e4;   /* 贴纸偏移阴影（Josh 签名手法 × 樱粉） */
  --shadow-sticker-lg: 5px 5px 1px #ffd6e4;/* 大号：hero 头像、置顶卡片 */
  --color-bg-halo: 236, 250, 243;          /* #ecfaf3 顶部光晕色 */
}

html[data-theme="dark"] {
  --color-accent-pink: 255, 159, 192;      /* #ff9fc0 */
  --color-accent-pink-bg: 58, 38, 48;      /* #3a2630 */
  --color-accent-green-bg: 18, 58, 46;     /* #123a2e */
  --shadow-sticker: 3px 3px 1px #3a2630;
  --shadow-sticker-lg: 5px 5px 1px #3a2630;
  --color-bg-halo: 16, 42, 30;             /* #102a1e */
}
```

### 2.3 完整色板参考

| 用途 | 浅色 | 深色 |
|------|------|------|
| 页面底 | `#fdfffe` | `#0f1512` |
| 卡片 | `#ffffff` | `#161c19` |
| 正文 | `#283556`（藏蓝灰） | `#dce8e2` |
| 次级文字 | `#5d6b85` | `#93a29b` |
| 弱提示文字 | `#8b97ac` | `#6f7d76` |
| 边框 | `#e0e8e6` | `#2a322e` |
| 主强调（绿） | `#00a87e` | `#3ddc97` |
| 点缀（樱粉文字） | `#d6487f` | `#ff9fc0` |
| 樱粉浅底 | `#ffe4ee` | `#3a2630` |
| 竹绿浅底 | `#e7f8f1` | `#123a2e` |
| 顶部光晕 | `#ecfaf3` | `#102a1e` |
| 贴纸阴影 | `#ffd6e4` | `#3a2630` |

两条纪律：
- **所有颜色都带一点色调**（底偏绿、字偏蓝、黑是墨绿黑）——学 Josh，纯中性灰会显得"冷"。
- 顶部光晕用法：`body { background: radial-gradient(ellipse at top, var(--color-bg-halo) 0%, transparent 60%) no-repeat, var(--color-fill); }`，浓度宁浅勿深，第一眼是"白"，第二眼才发现"泛着光"。

## 3. 字体系统

推荐组合（按"可爱浓度"递增，二选一）：

**方案 1 · antfu + Josh 混合（推荐先上这个）**
```css
/* 标题 / logo / 大数字（英文数字部分）：Josh 同款几何圆润 */
font-family: "League Spartan Variable", "Noto Sans SC", ui-sans-serif, system-ui, sans-serif;

/* 正文：antfu 同款 */
font-family: "Inter", "Noto Sans SC", "PingFang SC", ui-sans-serif, sans-serif;
```
League Spartan 可变字重 100-900，Google Fonts 一行引入，中文自动回退思源黑。h1 用字重 600-700 + 行高 0.9-1.1（Josh 的超大标题手法）。

**方案 2 · 更可爱（正文换文楷）**
```css
/* 标题、导航、按钮维持方案 1；仅 .markdown-body 正文： */
font-family: "LXGW WenKai Screen", "Noto Sans SC", sans-serif;
```
霞鹜文楷屏幕版自带手写温度，是中文博客"二次元感"性价比最高的一步。用 CDN 引入，正文行高放宽到 `1.9`。

代码字体保持现有 JetBrains Mono 不动。字号节奏：正文 15-16px、行高 1.8-1.9、段间距 1.25em（长文阅读舒适区）；h1 超大（clamp 2.2rem-3.5rem）。

## 4. 圆角与间距

| Token | 值 | 用途 |
|-------|-----|------|
| radius-md | 8px | 代码块、输入框、小按钮 |
| radius-lg | 12px | 卡片、文章列表项 |
| radius-xl | 16px | 首页大卡片、hero 区 |
| radius-full | 999px | 标签 pill、头像、开关 |

间距沿用 8px 栅格：组件内 8/12/16，组件间 24/32/48。圆角整体比现在加大一档——**大圆角是"可爱感"最低成本的最大来源**，比加粉色还有效。

## 5. 组件规范

- **链接**：保留你现有的波浪下划线（`decoration-wavy`，这本来就是 antfu 的签名手法），颜色统一竹绿；hover 时下划线从透明过渡到绿色。
- **贴纸偏移阴影**（Josh 签名手法，v1.1 新增）：**只给"主角级"元素用**——
  - h1 / 文章大标题：`text-shadow: var(--shadow-sticker)`
  - 激活的导航项：`filter: drop-shadow(3px 3px 1px #ffd6e4)`（Josh 原样手法，换成粉）
  - 首页头像 / logo / 置顶文章卡片：`box-shadow: var(--shadow-sticker-lg)`
  - hover 时阴影位移从 3px 涨到 5px（`transition: box-shadow .28s`），产生"贴纸被按下去又弹起来"的手感
  - **普通文章卡片不用**——阴影是层级语言，全员加阴影等于没有层级
- **标签 pill**：`radius-full`，浅底深字（浅色：樱粉底 `#ffe4ee` + `#d6487f` 字；竹绿底 `#e7f8f1` + `#00875c` 字；中性 `#f1f2f4` + `#57606a` 字）。理财类内容用粉，技术类用绿，生活类用中性——颜色即分类。
- **卡片**：白底 + 0.5-1px 细边框 + 12-16px 圆角；hover 把边框加深一档，仅置顶卡加贴纸阴影。
- **代码块**：Expressive Code 主题换 Vitesse Green（`@expressive-code/theme-vitesse-green` 或手填该主题色），和全站绿呼应。
- **选中文字**：`::selection { background: #ffe4ee; }`——全站唯一一处"藏在细节里的粉"。
- **滚动条**：细滚动条 6px，轨道透明，滑块用边框灰。
- **过渡节奏**：统一学 Josh 的 `280ms`（`--transition-medium`），hover 类用 `120ms`——全站动画节奏一致才有"被设计过"的感觉。

## 6. 二次元可爱元素清单（克制版）

按优先级排序，建议逐条加，每加一条停下来看整体是否还"antfu"：

1. **大圆角 + 粉色标签**（§4/§5，基建，必做）
2. **贴纸偏移阴影**（§5，v1.1 新增，Josh 同款 × 樱粉）——"可爱"和"专业"同时成立的最大功臣
3. **吉祥物贴纸**：你手上正好有六角色贴纸项目（良子、豆哥、坂田银时等）。用法：404 页放一张呆萌表情、评论区空状态放"快来抢沙发"贴纸、页脚角落放一个小剪影。**每页最多出现 1 只**。
4. **粉色 `::selection`**（一行 CSS 的惊喜感）
5. **hover 微动效**：贴纸 hover 时 `transform: rotate(-8deg) scale(1.05)`，280ms ease-out——贴纸"活"起来的关键。
6. **空状态插画**：搜索无结果、标签无文章时，用简笔小表情代替干巴巴的文字。
7. ❌ **不建议**：樱花飘落全屏特效、鼠标点击特效、背景音乐——会把 antfu 的"快、静"破坏掉。如果想加，只给 hero 区加 3-5 片静态樱花 SVG 装饰。

## 7. 落地步骤（对应现有代码结构）

1. `src/styles/index.css`：替换 §2.1 的两组主题变量 + 追加 §2.2 点缀/阴影/光晕 token（一次 commit，全站换底色）。
2. `src/styles/index.css` 加 body 顶部光晕背景（§2.3 末尾的写法）。
3. 清理 `tailwind.config.js` 里遗留的 `custom` 棕色系（已无引用的话直接删，避免新旧混用）。
4. `src/styles/index.css` 的 `@layer components` 里加 tag pill、卡片圆角、贴纸阴影样式；`.header-link-*` 波浪下划线保留，颜色自动跟随新 token，激活项加 drop-shadow 粉色偏移。
5. Expressive Code 主题切 Vitesse Green（`astro.config.mjs`）。
6. 字体按 §3 方案 1 先行（Google Fonts 引入 League Spartan + Inter），观察一周后决定是否上文楷。
7. 吉祥物贴纸放进 `public/assets/images/mascot/`，按 §6 第 3 条接入。

## 8. 备选方向（如果 A 看腻了）

- **B · 樱粉主打**：主强调 `#ef6da8`（浅）/ `#ff7ab0`（暗），底色改暖灰 `#faf5f7`，绿色降为点缀。可爱浓度 +30%，但长文阅读对比度下降，慎用。
- **C · Josh 原味蓝**：既然喜欢 Josh，也可以整体切他的色系——强调 `#1170d0`（浅）/ `#77bbff`（暗），正文藏蓝灰不变，樱粉保留做点缀。技术博主气质更浓，二次元感会弱一档。
- **D · 薰衣草紫**：主强调 `#7c6ff0`（浅）/ `#9d94f5`（暗），粉做点缀。中庸，但个人辨识度弱于绿。

## 附：joshuakgoldberg.com 实测 token 摘录（2026-08）

- 浅色：底 `#feffff`/`#fdffff`，正文 `#283556`，强调 `#1170d0`，柔和 `#789dc7`，subtle `#d7e9ef`
- 深色：底 `#111117`/`#071428`，正文 `#dae7f3`，强调 `#77bbff`
- 签名手法：`text-shadow/drop-shadow 3px 3px 1px var(--colorSubtle)`；h1 行高 0.85；圆形头像带偏移投影；顶部径向光晕
- 字体：League Spartan Variable（100-900 可变字重）
- 节奏：过渡 117/280/490/700ms 四档；圆角最高 1rem；流式 clamp 字号/间距（Utopia 风格）

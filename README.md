# vccyb's blog

个人博客（中文内容），基于社区主题 [astro-antfustyle-theme](https://github.com/lin-stephanie/astro-antfustyle-theme)（AAST，antfu 极简风）构建。静态站点，部署在 Vercel（chenyubo.vercel.app），推送 `main` 分支自动部署。

## 环境要求

- **Node >= 22.12**（Vercel 部署需在项目设置中选 Node 22.x runtime）
- pnpm

## 命令

```bash
pnpm install
pnpm dev      # 开发服务器（草稿可见）
pnpm build    # 生产构建到 dist/，postbuild 自动跑 Pagefind 索引
pnpm preview  # 本地预览生产构建
```

无测试与 lint 配置。

## 架构速览

- **配置集中在 `src/config.ts`**（SITE / UI / FEATURES 三个常量，类型在 `src/types.ts`），站点信息、导航、社交链接、功能开关都在这里改。
- **内容集合**（`src/content.config.ts`）：
  - `blog` — 文章 `src/content/blog/*.md`，schema 在 `src/schema.ts`（`postSchema`），必填 `title`（≤60 字）+ `pubDate`，可选 `tags/description/subtitle/toc/lastModDate/draft` 等。**无 categories/sticky/series 概念**，旧分类已并入 tags。
  - `shorts` — 动态短文 `src/content/shorts/*.md`。
  - `pages/home` — 首页文案 `src/content/home/index.md`。
- **评论**：Waline（`src/components/widgets/Waline.astro`，服务端 `https://blog-waline-wheat-two.vercel.app`），替换主题内置 Giscus（已删除）。沿用旧站 Waline 服务，历史评论仍在。深浅色跟随 `html.dark`；View Transitions 跳转时经 `astro:before-swap` 销毁 / `astro:page-load` 重挂。留言板在 `/message`。
- **中文字体**：`--font-sans` 的回退链首位是 `Noto Sans SC Variable`（`@fontsource-variable/noto-sans-sc` npm 包，unicode-range 切片按需加载），在 `src/styles/your.css` 导入。不走 fonts API（fontsource CDN 无 chinese-simplified 变量单文件）。
- **OG 图**：satori + sharp 构建时生成，中文字体用本地 `scripts/fonts/NotoSansSC-{Regular,Bold}.otf`（仅构建期用，勿放 public/）。逻辑在 `src/utils/og-image/`。
- **搜索**：Pagefind，构建后 `postbuild` 脚本生成索引。
- **站点自定义样式**写在 `src/styles/your.css`（BaseLayout 末位导入，层叠优先），如 Waline 的主题变量对齐。
- **主题源码备份**在 `themes/astro-antfustyle-theme`（已 gitignore，供上游同步 diff，不参与构建）。

## 迁移说明

2026-08 从「Astro Theme Yi」（Astro 4 + Tailwind）整站切换到 AAST。一次性迁移脚本 `scripts/migrate-posts.mjs`（frontmatter 改写：`date`→`pubDate`、`modDatetime`→`lastModDate`、`category` 并入 `tags`、删 series/sticky 等，超长标题拆 title+subtitle）。旧主题时代的 `DESIGN.md`/`FEATURES.md` 仅存档。

import { defineConfig, fontProviders, logHandlers } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import robotsTxt from 'astro-robots-txt'
import unocss from 'unocss/astro'
import astroExpressiveCode from 'astro-expressive-code'
import mdx from '@astrojs/mdx'
import { unified } from '@astrojs/markdown-remark'

import { remarkPlugins, rehypePlugins } from './plugins'
import { SITE } from './src/config'

const sansFallbacks = [
  '"Noto Sans SC Variable"',
  'ui-sans-serif',
  'system-ui',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
  '"Noto Color Emoji"',
  'sans-serif',
]

const monoFallbacks = [
  'ui-monospace',
  'SFMono-Regular',
  'Menlo',
  'Monaco',
  'Consolas',
  '"Liberation Mono"',
  '"Courier New"',
  'monospace',
]

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: SITE.website,
  base: SITE.base,
  build: {
    inlineStylesheets: 'never',
  },
  integrations: [
    sitemap(),
    robotsTxt(),
    unocss({ injectReset: true }),
    astroExpressiveCode(),
    mdx(),
  ],
  markdown: {
    syntaxHighlight: false,
    processor: unified({
      remarkPlugins: remarkPlugins,
      rehypePlugins: rehypePlugins,
    }),
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-sans',
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2'],
      fallbacks: sansFallbacks,
    },
    {
      provider: fontProviders.fontsource(),
      name: 'DM Mono',
      cssVariable: '--font-mono',
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2'],
      fallbacks: monoFallbacks,
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Roboto Condensed',
      cssVariable: '--font-condensed',
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2'],
      fallbacks: sansFallbacks,
    },
    // CJK body font (Noto Sans SC) is provided by the
    // `@fontsource-variable/noto-sans-sc` package, imported in
    // `src/styles/your.css` — the fontsource CDN has no single-file
    // variable subset for chinese-simplified, so the fonts API entry
    // would 404. Its family name `Noto Sans SC Variable` sits in
    // Inter's fallback chain above.
    // OG images use local Noto Sans SC OTFs from scripts/fonts/
    // (loaded directly in src/utils/og-image/generator.ts — no font entry needed)
  ],
  image: {
    // https://docs.astro.build/en/guides/images/#responsive-image-behavior
    // Used for all local (except `/public`) and authorized remote images using `![]()` syntax; not configurable per-image
    // Used for all `<Image />` and `<Picture />` components unless overridden with `layout` prop
    layout: 'constrained',
    responsiveStyles: true,
    domains: SITE.imageDomains,
  },
  vite: {
    logLevel: 'warn',
    build: { chunkSizeWarningLimit: 1200 },
  },
  logger: logHandlers.node({ level: 'info' }),
  experimental: {
    contentIntellisense: true,
    chromeDevtoolsWorkspace: true,
  },
})

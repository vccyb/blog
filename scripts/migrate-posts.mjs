// One-off migration: Astro Theme Yi -> astro-antfustyle-theme
// Reads stashed old content from /tmp/blog-migrate, writes new-format
// frontmatter into src/content/blog/ and src/content/shorts/.
// Run: node scripts/migrate-posts.mjs
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const SRC_DIR = '/tmp/blog-migrate/blog'
const OUT_BLOG = new URL('../src/content/blog/', import.meta.url)
const OUT_SHORTS = new URL('../src/content/shorts/', import.meta.url)

// Posts whose title exceeds the new 60-char limit: shortened main title,
// context moved to subtitle (AAST postSchema has no series concept).
const TITLE_OVERRIDES = {
  'ElementPlus-deep-Icon.md': {
    title: '组件实现的基本流程及 Icon 组件的实现',
    subtitle: 'Element-Plus 技术揭秘 · 组件库工程化实战',
  },
  'ElementPlus-deep-Npm.md': {
    title: '从终端命令解析器说起谈谈 npm 包管理工具的运行原理',
    subtitle: 'Element-Plus 技术揭秘 · 组件库工程化实战',
  },
}

// Renames (space in filename produces ugly %20 URLs)
const FILE_RENAMES = {
  'vue2-utils copy.md': 'vue2-utils-copy.md',
}

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) throw new Error('no frontmatter found')
  const body = text.slice(m[0].length)
  const meta = {}
  let currentList = null
  for (const line of m[1].split(/\r?\n/)) {
    const listItem = line.match(/^\s+-\s?(.*)$/)
    if (listItem && currentList) {
      currentList.push(listItem[1].trim())
      continue
    }
    const kv = line.match(/^([A-Za-z]+):\s?(.*)$/)
    if (!kv) continue
    const [, key, raw] = kv
    currentList = null
    if (raw === '') {
      meta[key] = []
      currentList = meta[key]
    } else {
      meta[key] = raw.trim().replace(/^["']|["']$/g, '')
    }
  }
  return { meta, body }
}

function migrate() {
  mkdirSync(OUT_BLOG, { recursive: true })
  mkdirSync(OUT_SHORTS, { recursive: true })

  let count = 0
  for (const file of readdirSync(SRC_DIR)) {
    if (!file.endsWith('.md')) continue
    const raw = readFileSync(join(SRC_DIR, file), 'utf8')
    const { meta, body } = parseFrontmatter(raw)

    // category merges into tags (category first, deduped)
    const tags = [...(meta.tags || [])]
    if (meta.category && !tags.includes(meta.category)) {
      tags.unshift(meta.category)
    }

    const out = []
    const override = TITLE_OVERRIDES[file]
    out.push(`title: ${override ? override.title : meta.title}`)
    const subtitle = override ? override.subtitle : meta.subtitle
    if (subtitle) out.push(`subtitle: ${subtitle}`)
    if (tags.length) {
      out.push('tags:')
      for (const t of tags) out.push(`  - ${t}`)
    }
    out.push(`pubDate: ${meta.date}`)
    if (meta.modDatetime) out.push(`lastModDate: ${meta.modDatetime}`)

    const frontmatter = `---\n${out.join('\n')}\n---\n`
    const destName = FILE_RENAMES[file] || file
    writeFileSync(join(OUT_BLOG.pathname, destName), frontmatter + body)
    count++
  }

  // old feed entry -> shorts (shorts schema requires title)
  const feedRaw = readFileSync('/tmp/blog-migrate/2024-05-03.md', 'utf8')
  const { body } = parseFrontmatter(feedRaw)
  const feedFm = [
    'title: 博客迁移到 Astro-Yi',
    'pubDate: 2024-05-03 11:31:13',
  ].join('\n')
  writeFileSync(
    join(OUT_SHORTS.pathname, '2024-05-03.md'),
    `---\n${feedFm}\n---\n${body}`
  )
  count++

  console.log(`migrated ${count} files`)
}

migrate()

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { decode } from 'html-entities'
import satori from 'satori'
import sharp from 'sharp'

import { ogImageMarkup } from '~/utils/og-image/template/markup'

import type { html } from 'satori-html'
import type { BgType } from '~/types'

interface SatoriFont {
  name: string
  weight: number
  style: string
  data: Buffer
}

let satoriFontsCache: SatoriFont[] | null = null

/**
 * Loads the local Noto Sans SC OTFs (build-time only, kept out of `public/`).
 * The theme default Inter has no CJK glyphs — Chinese titles would render
 * as tofu blocks without this.
 */
async function getSatoriFonts() {
  if (!satoriFontsCache) {
    const fontsDir = join(process.cwd(), 'scripts', 'fonts')
    const [regular, bold] = await Promise.all([
      readFile(join(fontsDir, 'NotoSansSC-Regular.otf')),
      readFile(join(fontsDir, 'NotoSansSC-Bold.otf')),
    ])
    satoriFontsCache = [
      { name: 'Noto Sans SC', weight: 400, style: 'normal', data: regular },
      { name: 'Noto Sans SC', weight: 700, style: 'normal', data: bold },
    ]
  }
  return satoriFontsCache
}

/**
 * Recursively unescapes HTML entities in a given virtual DOM node's children.
 *
 * Fix accidental HTML entity escaping in 'satori-html'.
 * @see https://github.com/natemoo-re/satori-html/issues/20#issuecomment-1999332693
 */
function unescapeHTML(node: ReturnType<typeof html>) {
  const children = node?.props?.children
  if (!children) {
    return
  } else if (Array.isArray(children)) {
    for (const n of children) {
      unescapeHTML(n)
    }
  } else if (typeof children === 'object') {
    unescapeHTML(children)
  } else if (typeof children === 'string') {
    node.props.children = decode(children)
  }
}

/**
 * Generates an Open Graph image as a PNG buffer.
 */
export async function generateOgImageBuffer(
  authorOrBrand: string,
  title: string,
  bgType: BgType
) {
  const node = ogImageMarkup(authorOrBrand, title, bgType)
  unescapeHTML(node)

  const satoriFonts = await getSatoriFonts()

  const svg = await satori(node, {
    // debug: true,
    width: 1200,
    height: 630,
    fonts: satoriFonts,
  })

  return await sharp(Buffer.from(svg))
    .png({
      compressionLevel: 9,
      quality: 100,
    })
    .toBuffer()
}

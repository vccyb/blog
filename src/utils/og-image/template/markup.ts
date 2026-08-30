import { html } from 'satori-html'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import backgroundBase64 from './base64'

import type { BgType } from '~/types'

// Site avatar embedded as base64 (satori renders at build time, no network).
const avatarBase64 = readFileSync(
  join(process.cwd(), 'public', 'avatar.png')
).toString('base64')

export const ogImageMarkup = (
  authorOrBrand: string,
  title: string,
  bgType: BgType
) => {
  if (!['plum', 'dot', 'rose', 'particle'].includes(bgType))
    throw new Error(
      "The value of 'bgType' must be one of the following: 'plum', 'dot', 'rose', 'particle'."
    )

  return html`<div
    tw="relative flex justify-center items-center w-full h-full"
    style="font-family: 'Noto Sans SC'"
  >
    <img
      tw="absolute inset-0 w-full h-full"
      src="${backgroundBase64[bgType]}"
      alt="open graph"
    />

    <div tw="flex items-center justify-start w-full px-18" style="gap: 20px">
      <div tw="self-start flex justify-center items-center">
        <img
          style="width: 7.5em; height: 7.5em; border-radius: 50%; object-fit: cover"
          src="data:image/png;base64,${avatarBase64}"
          alt="avatar"
        />
      </div>

      <div tw="flex flex-col" style="gap: 10px">
        <div tw="text-[#858585] text-2.1rem">${authorOrBrand}</div>
        <div tw="text-white text-3.1rem leading-relaxed mr-18">${title}</div>
      </div>
    </div>
  </div>`
}

import { withBasePath } from '~/utils/path'

export async function GET() {
  // https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest
  const manifest = {
    id: withBasePath('/'),
    name: "vccyb's blog",
    short_name: 'vccyb',
    description:
      '记录前端学习的过程，分享学习中遇到的问题和解决方案',
    icons: [
      {
        src: withBasePath('icon-192.png'),
        type: 'image/png',
        sizes: '192x192',
      },
      {
        src: withBasePath('icon-512.png'),
        type: 'image/png',
        sizes: '512x512',
      },
      {
        src: withBasePath('icon-mask.png'),
        type: 'image/png',
        sizes: '512x512',
        purpose: 'maskable',
      },
    ],
    scope: withBasePath('/'),
    start_url: withBasePath('/'),
    display: 'standalone',
    theme_color: '#fff',
    background_color: '#fff',
  }

  return new Response(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
    },
  })
}

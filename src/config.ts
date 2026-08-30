import type { Site, Ui, Features } from './types'

export const SITE: Site = {
  website: 'https://chenyubo.vercel.app/',
  base: '/',
  title: "vccyb's blog",
  description:
    '记录前端学习的过程，分享学习中遇到的问题和解决方案。争取做到好玩有趣，通俗易懂。希望沉淀知识，帮助自己也帮助他人!',
  author: 'vccyb',
  lang: 'zh-Hans',
  ogLocale: 'zh_CN',
  imageDomains: [],
}

export const UI: Ui = {
  internalNavs: [
    {
      path: '/blog',
      title: 'Blog',
      displayMode: 'alwaysText',
      text: 'Blog',
    },
    {
      path: '/projects',
      title: 'Project',
      displayMode: 'alwaysText',
      text: 'Project',
    },
    {
      path: '/photos',
      title: 'Photo',
      displayMode: 'iconToTextOnMobile',
      text: 'Photo',
      icon: 'i-ri-camera-ai-line',
    },
    {
      path: '/shorts',
      title: '动态',
      displayMode: 'iconToTextOnMobile',
      text: '动态',
      icon: 'i-ri-sparkling-2-line',
    },
    {
      path: '/message',
      title: '留言',
      displayMode: 'iconToTextOnMobile',
      text: '留言',
      icon: 'i-ri-chat-smile-3-line',
    },
    {
      path: '/about',
      title: '关于',
      displayMode: 'iconToTextOnMobile',
      text: '关于',
      icon: 'i-ri-user-line',
    },
  ],
  socialLinks: [
    {
      link: 'https://github.com/vccyb',
      title: 'GitHub 上的 vccyb',
      displayMode: 'alwaysIcon',
      icon: 'i-uil-github-alt',
    },
    {
      link: 'https://space.bilibili.com/3616379',
      title: 'B 站主页',
      displayMode: 'alwaysIcon',
      icon: 'i-ri-bilibili-fill',
    },
    {
      link: '/resume',
      title: '个人简历',
      displayMode: 'alwaysIcon',
      icon: 'i-ri-profile-line',
    },
    {
      link: 'mailto:13170906656@163.com',
      title: '发送邮件',
      displayMode: 'alwaysIcon',
      icon: 'i-ri-mail-line',
    },
  ],
  navBarLayout: {
    left: [],
    right: [
      'internalNavs',
      'hr',
      'socialLinks',
      'hr',
      'searchButton',
      'themeButton',
      'rssLink',
    ],
    mergeOnMobile: true,
  },
  tabbedLayoutTabs: false,
  postView: {
    postMetaStyle: 'minimal',
    useCoverAltAsCaption: true,
  },
  groupView: {
    maxGroupColumns: 3,
    showGroupItemColorOnHover: true,
  },
  githubView: {
    monorepos: [],
    mainLogoOverrides: [],
    subLogoMatches: [],
  },
  externalLink: {
    newTab: false,
    cursorType: '',
    showNewTabIcon: false,
  },
}

/**
 * Globally controls whether to enable special features:
 *  - Set to `false` or `[false, {...}]` to disable the feature.
 *  - Set to `[true, {...}]` to enable and configure the feature.
 */
export const FEATURES: Features = {
  slideEnterAnim: [true, { enterStep: 30 }],
  ogImage: [
    true,
    {
      authorOrBrand: 'vccyb',
      fallbackTitle: `${SITE.description}`,
      fallbackBgType: 'plum',
      collections: [
        { collection: 'blog', pathnamePrefix: '/blog' },
        { collection: 'shorts', pathnamePrefix: '/shorts' },
      ],
    },
  ],
  toc: [
    true,
    {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
      displayPosition: 'right',
      displayMode: 'content',
    },
  ],
  share: [
    true,
    {
      twitter: false,
      bluesky: false,
      mastodon: false,
      facebook: false,
      pinterest: false,
      reddit: false,
      telegram: false,
      whatsapp: false,
      email: false,
    },
  ],
  // Giscus is not used — comments are provided by Waline (see
  // src/components/widgets/Waline.astro). RenderPost no longer reads this
  // entry; the per-post switch is the frontmatter `giscus` flag.
  giscus: false,
  search: [
    true,
    {
      includes: ['blog', 'shorts'],
      filter: true,
      navHighlight: true,
      batchLoadSize: [true, 5],
      maxItemsPerPage: [true, 3],
    },
  ],
  tag: [
    true,
    {
      displayPosition: 'right',
      displayMode: 'always',
      filterMode: 'OR',
    },
  ],
}

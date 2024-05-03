// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

/**
 * title {string} website title
 * favicon {string} website favicon url
 * description {string} website description
 * author {string} author
 * avatar {string} Avatar used in the profile
 * motto {string} used in the profile
 * url {string} Website link
 * recentBlogSize {number} Number of recent articles displayed in the sidebar
 * archivePageSize {number} Number of articles on archive pages
 * postPageSize {number} Number of articles on blog pages
 * feedPageSize {number} Number of articles on feed pages
 * beian {string} Chinese policy
 */
export const site = {
  title: "vccyb's blog", // required
  favicon: "/favicon.svg", // required
  description:
    "该博客记录我前端学习的过程，分享一些我在学习过程中遇到的问题和解决方案。争取做到好玩有趣，通俗易懂。希望沉淀知识，帮助自己也帮助他人!",
  author: "vccyb", // required
  avatar: "/avatar.png", // required
  motto: "zero to mastery",
  url: "https://chenyubo.vercel.app/",
  recentBlogSize: 5,
  archivePageSize: 25,
  postPageSize: 10,
  feedPageSize: 20,
  beian: "",
};

/**
 * busuanzi {boolean} link: https://busuanzi.ibruce.info/
 * lang {string} Default website language
 * codeFoldingStartLines {number}
 * ga {string|false}
 */
export const config = {
  busuanzi: false,
  lang: "zh-cn", // en | zh-cn
  codeFoldingStartLines: 16, // Need to re-run the project to take effect
  ga: false, // If you want to integrate with Google Analytics, just enter your GA-ID here.
};

/**
 * Navigator
 * name {string}
 * iconClass {string} icon style
 * href {string}  link url
 * target {string} optional "_self|_blank" open in current window / open in new window
 */
export const categories = [
  {
    name: "博客",
    iconClass: "ri-draft-line",
    href: "/blog/1",
  },
  {
    name: "动态",
    iconClass: "ri-lightbulb-flash-line",
    href: "/feed/1",
  },
  {
    name: "归档",
    iconClass: "ri-archive-line",
    href: "/archive/1",
  },
  {
    name: "留言",
    iconClass: "ri-chat-1-line",
    href: "/message",
  },
  {
    name: "搜索",
    iconClass: "ri-search-line",
    href: "/search",
  },
  {
    name: "更多",
    iconClass: "ri-more-fill",
    href: "javascript:void(0);",
    children: [
      {
        name: "关于本站",
        iconClass: "ri-information-line",
        href: "/about",
      },
      {
        name: "友情链接",
        iconClass: "ri-user-5-line",
        href: "/friends",
        target: "_self",
      },
    ],
  },
];

/**
 * Personal link address
 */
export const infoLinks = [
  {
    icon: "ri-bilibili-fill",
    name: "bilibili",
    outlink: "https://space.bilibili.com/3616379?spm_id_from=333.1007.0.0",
  },
  {
    icon: "ri-github-fill",
    name: "github",
    outlink: "https://github.com/vccyb",
  },
];

/**
 * donate
 * enable {boolean}
 * tip {string}
 * wechatQRCode: Image addresses should be placed in the public directory.
 * alipayQRCode: Image addresses should be placed in the public directory.
 * paypalUrl {string}
 */
export const donate = {
  enable: true,
  tip: "感谢大佬送来的咖啡☕",
  wechatQRCode: "/WeChatQR.JPG",
  alipayQRCode: "/AliPayQR.JPG",
  paypalUrl: "https://paypal.me/xxxxxxxxxx",
};

/**
 * Friendship Links Page
 * name {string}
 * url {string}
 * avatar {string}
 * description {string}
 */
export const friendshipLinks = [
  // {
  //   name: "Cirry's Blog",
  //   url: 'https://cirry.cn',
  //   avatar: "https://cirry.cn/avatar.png",
  //   description: '前端开发的日常'
  // },
];

/**
 * Comment Feature
 * enable {boolean}
 * serverUrl {string} server link
 * lang {string} link: https://waline.js.org/guide/features/i18n.html
 * pageSize {number} number of comments per page. default 10
 * wordLimit {number} Comment word s limit. When a single number is filled in, it 's the maximum number of comment words. No limit when set to 0
 * count {number} recent comment numbers
 * pageview {boolean} display the number of page views and comments of the article
 * reaction {string | string[]} Add emoji interaction function to the article
 * requiredMeta {string[]}  Set required fields, default anonymous
 * whiteList {string[]} set some pages not to display reaction
 */
export const comment = {
  enable: true,
  serverUrl: "https://blog-waline-wheat-two.vercel.app",
  lang: "zh-CN",
  pageSize: 20,
  wordLimit: "",
  count: 5,
  pageview: true,
  reaction: true,
  requiredMeta: ["nick", "mail"],
  whiteList: ["/message/", "/friends/"],
};

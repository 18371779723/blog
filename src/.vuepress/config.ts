import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/blog/",

  lang: "zh-CN",
  title: "王彦群的博客",
  description: "王彦群的博客演示",

  theme,

  // 和 PWA 一起启用
  // shouldPrefetch: false,
});

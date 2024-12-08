import { defineUserConfig } from "vuepress";

import theme from "./theme.js";
import { autoSidebarPlugin } from './plugins/autoSidebar';

export default defineUserConfig({
  base: "/bolg/",
  lang: "zh-CN",
  title: "王彦群Coding",
  description: "王彦群的博客演示",
  theme,

  // 和 PWA 一起启用
  // shouldPrefetch: false,
  plugins: [
    autoSidebarPlugin,
  ],
});

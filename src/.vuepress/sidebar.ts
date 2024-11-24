import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    "",
    {
      text: "如何使用",
      icon: "laptop-code",
      prefix: "demo/",
      link: "demo/",
      children: "structure",
    },
    {
      text: "文章",
      icon: "book",
      prefix: "posts/",
      children: "structure",
    },
    "intro",
    {
      text: "幻灯片",
      icon: "person-chalkboard",
      link: "https://ecosystem.vuejs.press/zh/plugins/markdown/revealjs/demo.html",
    },
  ],
  "/small/": [
    "",
    {
      text: "核心功能实现",
      icon: "laptop-code",
      prefix: "功能实现/",
      link: "功能实现/",
      children: "structure",
    },
  ],
  "/education/": [
    "",
    {
      text: "系统架构",
      icon: "sitemap",
      prefix: "architecture/",
      children: "structure",
    },
    {
      text: "核心功能",
      icon: "code",
      prefix: "features/",
      children: "structure",
    },
  ],
  "/big-market/": [
    "",
    {
      text: "系统设计",
      icon: "diagram-project",
      prefix: "design/",
      children: "structure",
    },
    {
      text: "抽奖业务核心实现",
      icon: "cubes",
      prefix: "抽奖模块/",
      children: "structure",
    },
  ],
  "/dev-notes/": [
    "",
    {
      text: "后端开发",
      icon: "code",
      prefix: "backend/",
      children: "structure",
    },
  ],
});

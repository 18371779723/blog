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

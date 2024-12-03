import { sidebar } from "vuepress-theme-hope";
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// 动态生成项目目录的子目录配置
const generateProjectSidebar = () => {
  const projectsPath = path.resolve(__dirname, '../projects');
  const projects = fs.readdirSync(projectsPath)
    .filter(file => {
      const filePath = path.join(projectsPath, file);
      return fs.existsSync(filePath) && 
             fs.statSync(filePath).isDirectory() && 
             file !== 'node_modules';
    });

  return projects.map(project => {
    const readmePath = path.join(projectsPath, project, 'README.md');
    let title = project;
    let icon = "folder";
    
    if (fs.existsSync(readmePath)) {
      const content = fs.readFileSync(readmePath, 'utf-8');
      const frontMatter = matter(content);
      title = frontMatter.data.title || project;
      icon = frontMatter.data.icon || "folder";
    }
    
    return {
      text: title,
      icon: icon,
      prefix: `${project}/`,
      children: "structure",
    };
  });
};

export default sidebar({
  "/": ["", "intro"],
  "/projects/": [
    "",
    {
      text: "项目列表",
      icon: "folder-open",
      prefix: "",
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
  "/internship/": [
    "",
    {
      text: "实习经历",
      icon: "tasks",
      prefix: "work/",
      children: "structure",
    },
  ],
  "/projects/small/": [
    "",
    {
      text: "核心功能实现",
      icon: "laptop-code",
      prefix: "功能实现/",
      link: "功能实现/",
      children: "structure",
    },
  ],
  "/projects/education/": [
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
  "/projects/big-market/": [
    "",
    {
      text: "抽奖业务核心实现",
      icon: "cubes",
      prefix: "抽奖模块/",
      children: "structure",
    },
  ],
  "/projects/code-review/": [
    "",
    {
      text: "核心功能",
      icon: "code",
      prefix: "features/",
      children: "structure",
    },
    {
      text: "技术实现",
      icon: "gear",
      prefix: "implementation/",
      children: "structure",
    },
  ],
});

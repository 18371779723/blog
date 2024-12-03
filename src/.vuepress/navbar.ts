import { navbar } from "vuepress-theme-hope";
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// 动态生成项目导航
const generateProjectNav = () => {
  const projectsPath = path.resolve(__dirname, '../projects');
  return fs.readdirSync(projectsPath)
    .filter(file => {
      const filePath = path.join(projectsPath, file);
      return fs.existsSync(filePath) && 
             fs.statSync(filePath).isDirectory() && 
             file !== 'README.md' && 
             file !== 'node_modules';
    })
    .map(project => {
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
        link: `/projects/${project}/`,
      };
    })
    .sort((a, b) => a.text.localeCompare(b.text)); // 按标题字母顺序排序
};

export default navbar([
  "/",
  {
    text: "实习经历",
    icon: "briefcase",
    children: [
      {
        text: "湖北爱库特科技有限公司",
        icon: "building",
        link: "/internship/",
      },
    ],
  },
  {
    text: "项目经历",
    icon: "project-diagram",
    children: [
      {
        text: "大营销平台",
        icon: "chart-line",
        link: "/projects/big-market/",
      },
      {
        text: "小型支付商城系统",
        icon: "shop",
        link: "/projects/small/",
      },
      {
        text: "在线教育平台",
        icon: "graduation-cap",
        link: "/projects/education/",
      },
      {
        text: "OpenAI代码评审组件",
        icon: "robot",
        link: "/projects/code-review/",
      },
    ],
  },
  {
    text: "开发小记",
    icon: "code",
    link: "/dev-notes/",
  },
]);

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export const autoSidebarPlugin = {
  name: 'vuepress-plugin-auto-sidebar',
  
  async onInitialized(app) {
    // 处理后端开发文档
    const backendPath = path.resolve(__dirname, '../../dev-notes/backend');
    const files = fs.readdirSync(backendPath)
      .filter(file => file.endsWith('.md'))
      .map(file => `- [${path.parse(file).name}](./backend/${file})`);

    const readmePath = path.resolve(__dirname, '../../dev-notes/README.md');
    let content = fs.readFileSync(readmePath, 'utf-8');
    
    // 在 ## 后端开发 后插入文件列表
    const sections = content.split('## 后端开发');
    content = `${sections[0]}## 后端开发\n${files.join('\n')}\n`;
    
    fs.writeFileSync(readmePath, content);

    // 处理实习经历文档
    const internshipLinks = generateLinks('internship');
    const internshipReadmePath = path.resolve(__dirname, '../../internship/README.md');
    let internshipContent = `---
title: 实习经历
icon: briefcase
---

# 实习经历

这里记录了我的实习经历和工作总结。

## 实习单位
${internshipLinks.map(link => `- [${link.title}](./${link.link})`).join('\n')}

::: tip 提示
本文档会自动收集 internship 目录下的所有实习经历文档并展示链接。如需添加新的实习经历，只需在该目录下创建新的文档即可。
:::`;
    
    fs.writeFileSync(internshipReadmePath, internshipContent);

    // 处理项目经历文档
    const projectLinks = generateLinks('projects');
    const projectReadmePath = path.resolve(__dirname, '../../projects/README.md');
    let projectContent = `---
title: 项目经历
icon: project-diagram
---

# 项目经历

这里记录了我的项目开发经历。

## 项目列表
${projectLinks.map(link => `- [${link.title}](./${link.link})`).join('\n')}

::: tip 提示
本文档会自动收集 projects 目录下的所有项目经历文档并展示链接。如需添加新的项目经历，只需在该目录下创建新的项目文档即可。
:::`;
    
    fs.writeFileSync(projectReadmePath, projectContent);
  }
}; 

// 通用的链接生成函数
const generateLinks = (subDir: string) => {
  const baseDir = path.resolve(__dirname, '../../');
  const targetDir = path.join(baseDir, subDir);
  
  try {
    const files = fs.readdirSync(targetDir);
    
    return files
      .filter(file => {
        try {
          const filePath = path.join(targetDir, file);
          return fs.statSync(filePath).isDirectory() && file !== 'README.md' && file !== 'node_modules';
        } catch (err) {
          console.error(`Error checking directory ${file}:`, err);
          return false;
        }
      })
      .map(dir => {
        try {
          const readmePath = path.join(targetDir, dir, 'README.md');
          if (fs.existsSync(readmePath)) {
            const content = fs.readFileSync(readmePath, 'utf-8');
            const frontMatter = matter(content);
            const title = frontMatter.data.title || dir;
            return {
              title: title,
              link: `${dir}/README.md`
            };
          }
          // 如果没有 README.md，使用目录名作为标题
          return {
            title: dir,
            link: `${dir}/`
          };
        } catch (err) {
          console.error(`Error processing ${dir}:`, err);
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.title.localeCompare(b.title)); // 按标题字母顺序排序
  } catch (err) {
    console.error(`Error reading directory ${targetDir}:`, err);
    return [];
  }
}; 
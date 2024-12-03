import fs from 'fs';
import path from 'path';

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
  }
};

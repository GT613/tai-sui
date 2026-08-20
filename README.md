# 太岁：雾下见天光

以 priest 小说《太岁》的蒸汽朋克修真世界观为背景制作的搜打撤网页小游戏。

## 上传 GitHub

请把本文件所在目录中的全部内容上传到 GitHub 仓库根目录。仓库首页应直接看到 `app`、`public`、`worker`、`package.json` 等内容，不要在外面再套一层文件夹。

`.openai` 与 `.gitignore` 需要一并上传；它们体积很小，并且不包含账号或密钥。不要上传 `node_modules`、`dist`、`.git`、`.wrangler` 或 `.sites`。

## 本地运行

需要 Node.js 22.13 或更高版本：

```bash
pnpm install
pnpm dev
```

构建命令：

```bash
pnpm build
```

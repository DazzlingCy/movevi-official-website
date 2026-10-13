# MOVEVI 木卫六官网

一家以全球城市跑步数据库和智能运动硬件为核心的家庭运动科技公司。

## 在线访问

- GitHub Pages：https://dazzlingcy.github.io/movevi-official-website/
- 现有官网：https://movevi-world-at-home.jovialbat6.chatgpt.site/

两个站点均公开访问，无需 ChatGPT 登录。

## 本地开发

使用 Node.js 22，无需安装运行依赖。

```sh
npm run dev
# http://127.0.0.1:4173/
npm run check
```

`dist/` 是完整静态网站。HTML、CSS、JavaScript、图片、视频和 Three.js 均使用相对路径，可直接部署到 GitHub Pages 项目子路径。`scripts/serve.mjs` 仅用于本地预览。

## GitHub Pages 自动发布

提交到 `main` 后，`.github/workflows/deploy-pages.yml` 自动执行检查，将 `dist/` 上传为 Pages artifact，再发布至 `github-pages` 环境。也可在 Actions 的 **Deploy MOVEVI website** 中手动运行。

```sh
git add dist scripts docs package.json README.md
git commit -m "Update MOVEVI website"
git push origin main
```

在新克隆的 GitHub 仓库中，`origin` 指向 GitHub。本地原始 Sites 工作区使用新增的 `github` remote，不改变 Sites 发布配置；从该工作区同步请用 `git push github HEAD:main`。GitHub Pages 自动发布不等于同步更新 Sites，原官网仍通过原有 Sites 发布流程更新。

仓库 Settings → Pages 的 Source 使用 **GitHub Actions**。工作流仅发布 `dist/`，不发布源码说明、原始压缩包或 QA 文件。

## 当前页面

- 首页：持续旋转、可拖动的 Three.js 地球；巴黎／东京视频窗口；TS3 实拍。
- 品牌故事：使命、公司定位、城市图文与 195 个国家和地区的实景建设目标。
- 运动动力：从“靠自律完成”到“为探索出发”的滚动切换。
- 世界城市：横向城市卡片，当前城市播放运动视频。
- 产品体验：硬件、App 与真实城市路线的关系，以及四步 App 界面展示。
- 硬件产品：四个系列、八款产品、图片图库、完整参数与咨询入口。
- 价值观与用户价值：六项原则、家庭运动场景与城市跑步轮播。

桌面、手机和平板共享白灰蓝视觉规范。桌面使用原生滚动驱动的场景过渡；移动端采用顺序阅读、入场动效和触屏卡片。视频及地球在离屏或后台停止，自动播放失败时保留海报，支持系统减少动态和节省流量设置。

## 目录

- `dist/index.html`：内容、导航和弹窗结构。
- `dist/design-system.css`：桌面视觉规范。
- `dist/mobile.css`、`dist/mobile.js`：手机和平板适配。
- `dist/hero-earth.js`、`dist/hero-cities.js`：首页地球与城市窗口。
- `dist/brand-scroll.js`、`dist/story-scroll.js`：品牌与困境页滚动叙事。
- `dist/products-data.js`、`dist/products.js`：产品资料、图库与参数比较。
- `dist/lifestyle.css`、`dist/assets/lifestyle/`：TS3 / TS3 PRO 实拍展示。
- `dist/media-config.js`：视频源、移动版本、海报和用途。
- `scripts/check*.mjs`：内容、资源及交互生命周期检查。
- `docs/`：素材来源、产品参数溯源和设计记录。
- `.openai/hosting.json`：现有 Sites 项目标识；不含访问凭据。

## 素材与内容

品牌、Logo、App 界面、产品参数、产品实拍及渲染图由木卫六提供。TS3 与 TS3 PRO 实拍按原压缩包型号分别映射；完整参数和已有渲染视角保留。TS6 PRO 尺寸已确认为 **1750 × 845 × 1525 mm**。

城市视频为已记录来源的氛围素材，不等同于实际上线路线，也不表示画面中的人物或品牌为木卫六背书。195 个国家和地区为建设目标。素材记录见：

- [城市视频与 App 界面](docs/media-provenance.md)
- [地球纹理与地理数据](docs/globe-provenance.md)
- [产品参数与型号映射](docs/product-provenance.md)
- [TS3 系列实拍](docs/lifestyle-sources.md)
- [移动端适配记录](docs/mobile-release.md)

原始品牌手册、Excel、照片压缩包、临时 QA 输出及凭据不纳入网站发布。第三方库保留对应 LICENSE，仓库公开不改变品牌及素材权利。

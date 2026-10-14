# Homepage world composition

The homepage presents the supplied TS3 product render without a model. Its white studio background blends into the page; the globe fades toward the product to form one composition. Other product photography is unchanged.

Paris, New York and Sydney thumbnails in `dist/assets/landmarks/` are 520-pixel WebP derivatives of the existing, documented site images in `dist/assets/`. No new external photography is introduced. Tokyo and Paris videos retain their existing sources and playback lifecycle; see `media-provenance.md`.

Globe city dots and thin connections rotate with the Earth. They illustrate MOVEVI's global ambition, and do not represent available routes, device connectivity or live customer activity. The scenic photographs likewise illustrate destinations.

Validation: desktop 1440×900 and 1366×768, phone 390×844 and tablet 768×1024; native scrolling, globe keyboard control, product anchor and offscreen playback pause. `npm run check` also verifies the city arc coordinates remain finite and just above the sphere, alongside existing animation lifecycle checks.

## 八城展示更新 · 2026-10-14

首屏六个景观窗口展示八座城市：巴黎/罗马、纽约/伦敦按窗口依次淡入轮换，上海、新加坡、悉尼保持静态，东京/巴黎沿用原有视频轮换。地球和无人 TS3 产品渲染保持主体；离屏、后台与节省流量时暂停轮换。

全球内容页扩展为纽约、巴黎、伦敦、东京、上海、新加坡、罗马、悉尼八城，提供可点击缩略图、拖动和方向键选择。前四城使用已核验视频；其余使用城市照片。只播放当前卡片的视频，切换照片时停止旧视频。八城是氛围展示，不表示已上线数量，195 国地区仍是建设目标。

新增图像来源：均按 Pexels License（https://www.pexels.com/license/）使用，原页显示 Free；2026-10-14 核验。压缩至宽图 1600px / 小图 520px WebP。不得暗示素材作者、建筑品牌或画面人物为 MOVEVI 背书。

| 城市 | 作者 | 素材页 | 本地文件 |
| --- | --- | --- | --- |
| 上海 | zhang kaiyv | https://www.pexels.com/photo/shanghai-skyline-under-blue-sky-612419/ | landmarks/shanghai[-wide].webp |
| 新加坡 | Shlok Rana | https://www.pexels.com/photo/singapore-skyline-with-marina-bay-sands-32850838/ | landmarks/singapore[-wide].webp |
| 罗马 | Chait Goli | https://www.pexels.com/photo/colosseum-italy-1797161/ | landmarks/rome[-wide].webp |

伦敦沿用现有视频海报；纽约、巴黎、东京、悉尼沿用已记录素材。新加坡最初试选 5370730 竖幅图未采用，正式版使用上表横幅图。

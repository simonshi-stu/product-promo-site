# 商品宣发文案生成器 / Product Promo Copy Generator

## 中文说明

这是一个本地运行的前端网站原型：可以上传产品图片，也可以只填写商品品类、价格带和提示词。应用会调用视觉语言模型生成小红书、抖音、天猫、拼多多等平台的产品介绍、宣发语、推广关键词和话题标签。

当前默认配置使用智谱 GLM-5V-Turbo。

生成逻辑会自动按平台决定语气，不再使用全局“文案语气”选项。价格带会作为高优先级变量进入“价格策略”和各平台的“价格角度”。最近 10 次生成结果会保存在浏览器本地历史记录中，方便回看和复制。

### 启动

复制 `.env.example` 为 `.env`，填入你的 API Key，然后执行：

```powershell
npm start
```

然后打开：

```text
http://localhost:5178
```

Windows 上也可以直接运行：

```text
start-site.cmd
```

如果浏览器打不开，请确认启动窗口里还显示着服务运行信息；关闭窗口后网站也会停止。

### 智谱 GLM-5V-Turbo 配置

```env
AI_PROVIDER=zhipu
ZHIPU_API_KEY=你的_智谱_API_Key
AI_MODEL=glm-5v-turbo
AI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
PORT=5178
```

### 需要你提供的信息

- API Key，用于本地服务端调用模型
- 希望默认生成的平台列表
- 你的品牌调性、禁用词、合规限制
- 常用产品品类、价格带和活动信息

## English

This is a local web prototype for generating product promotion copy. You can upload a product image or generate from text-only inputs such as category, price range, and prompts. The app calls a vision-language model to produce platform-specific copy for Xiaohongshu, Douyin, Tmall, Pinduoduo, and other commerce channels.

The current default provider is Zhipu GLM-5V-Turbo.

The app now lets each platform determine its own tone automatically instead of using a global tone selector. Price range is treated as a high-priority input and appears in the overall price strategy plus each platform's price angle. The latest 10 generations are saved in local browser history for quick recovery and copying.

### Run Locally

Copy `.env.example` to `.env`, add your API key, then run:

```powershell
npm start
```

Open:

```text
http://localhost:5178
```

On Windows, you can also run:

```text
start-site.cmd
```

Keep the terminal window open while using the app. Closing it stops the local website.

### Zhipu GLM-5V-Turbo Configuration

```env
AI_PROVIDER=zhipu
ZHIPU_API_KEY=your_Zhipu_API_key
AI_MODEL=glm-5v-turbo
AI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
PORT=5178
```

### What You Can Customize

- Target platforms
- Brand tone
- Compliance limits and banned words
- Product categories, price ranges, and campaign details

### Deployment Note

This project includes a small backend proxy so the API key is not exposed in the browser. Do not deploy it as a static-only GitHub Pages site. Use a Node-capable host such as Render, Railway, Fly.io, or a VPS, and configure the API key as an environment variable on the hosting platform.

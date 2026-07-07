import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(__dirname, "public");

const envPath = join(__dirname, ".env");
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

const port = Number(process.env.PORT || 5178);
const provider = process.env.AI_PROVIDER || "zhipu";
const apiKey = process.env.ZHIPU_API_KEY;
const baseUrl = process.env.AI_BASE_URL || "https://open.bigmodel.cn/api/paas/v4";
const model = process.env.AI_MODEL || "glm-5v-turbo";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function readBody(req, maxBytes = 22 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("图片或请求内容过大，请压缩到 15MB 以内后再试。"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("模型返回内容不是有效 JSON。");
    return JSON.parse(match[0]);
  }
}

function buildPrompt(payload) {
  const platforms = payload.platforms?.length ? payload.platforms.join("、") : "小红书、抖音、天猫、拼多多";
  const hasImage = Boolean(payload.imageDataUrl?.startsWith("data:image/"));
  return [
    "你是一名资深电商增长文案策划，擅长根据商品图片、用户场景和不同平台的高转化表达生成宣发文案。",
    hasImage
      ? "用户上传了商品图片。请先观察图片，提炼可见的外观、颜色、形态、使用场景和可能的产品属性。"
      : "用户没有上传商品图片。请只根据用户填写的品类、价格带和提示词推理，不要假装看到了图片。",
    "不要虚构无法从图片或用户信息判断的品牌、认证、功效、材质和参数；不确定的信息要用保守表达。",
    `目标平台：${platforms}`,
    `用户补充提示：${payload.prompt || "无"}`,
    `品类：${payload.category || "请根据图片判断"}`,
    `价格带：${payload.priceRange || "未指定"}`,
    "价格带是高优先级信息，必须影响定位、利益点、标题和 CTA：如果是低价或入门价，要体现尝鲜门槛、性价比、平替/入门体验；如果是中高价，要体现专业度、品质、礼品属性或长期价值。",
    "不同平台语气由平台自动决定：小红书偏真实种草和生活方式，抖音偏短视频冲击和口播转化，天猫偏专业可信和参数化，拼多多偏直接促销和性价比，京东偏品质保障和效率，视频号偏熟人信任和稳健表达，直播平台偏利益点密度。",
    "输出必须是中文 JSON，不要 Markdown，不要代码块。",
    "JSON 结构：",
    `{
      "product_summary": "一句话产品介绍",
      "price_strategy": "结合价格带给出的整体定价/转化策略",
      "visual_insights": ["如果有图片，写从图片观察到的关键特征；如果没有图片，写基于文字信息推断的产品方向"],
      "core_selling_points": ["可用于全平台的核心卖点"],
      "audience": ["适合的人群或场景"],
      "platforms": [
        {
          "name": "平台名称",
          "positioning": "该平台推荐的内容切入角度",
          "price_angle": "该平台如何表达价格带和价值感",
          "titles": ["标题1", "标题2", "标题3"],
          "short_intro": "80字以内产品介绍",
          "promotion_copy": ["宣发语1", "宣发语2", "宣发语3", "宣发语4"],
          "traffic_keywords": ["大流量关键词"],
          "hashtags": ["话题标签"],
          "cta": "行动引导",
          "risk_note": "避免违规或夸大的提醒"
        }
      ]
    }`
  ].join("\n");
}

async function handleGenerate(req, res) {
  if (!apiKey) {
    sendJson(res, 500, { error: "缺少 API Key。请先在本地 .env 中配置 ZHIPU_API_KEY。" });
    return;
  }

  try {
    const raw = await readBody(req);
    const payload = JSON.parse(raw || "{}");
    const hasImage = Boolean(payload.imageDataUrl?.startsWith("data:image/"));
    const userContent = [
      ...(hasImage ? [{
        type: "image_url",
        image_url: { url: payload.imageDataUrl }
      }] : []),
      {
        type: "text",
        text: buildPrompt(payload)
      }
    ];

    const requestBody = {
      model,
      messages: [
        {
          role: "system",
          content: "你只输出有效 JSON，不要 Markdown，不要代码块。"
        },
        {
          role: "user",
          content: userContent
        }
      ],
      stream: false,
      ...(provider === "zhipu" ? { thinking: { type: "enabled" } } : { enable_thinking: false }),
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 3500
    };

    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    const data = await response.json();

    if (!response.ok) {
      const upstreamMessage = data.message || data.error?.message || `${provider} 请求失败，请检查 Key、模型权限或网络。`;
      const modelDeniedHint = /access to model denied/i.test(upstreamMessage)
        ? "。这通常表示当前 API Key / workspace / billing 对该模型没有实际调用资格；请检查 API key 所属账号、计费和模型权限，或临时把 AI_MODEL 改成其他可用模型测试。"
        : "";
      sendJson(res, response.status, {
        error: `${upstreamMessage}${modelDeniedHint} 当前接口：${baseUrl}，当前模型：${model}`
      });
      return;
    }

    const content = data.choices?.[0]?.message?.content || "";
    const text = Array.isArray(content) ? content.map((part) => part.text || "").join("\n") : String(content || "");
    sendJson(res, 200, { result: extractJson(text || "{}"), raw: text });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "生成失败。" });
  }
}

async function handleHealth(req, res) {
  const keyConfigured = Boolean(apiKey);
  sendJson(res, 200, {
    keyConfigured,
    provider,
    model,
    modelVisible: null,
    apiStatus: keyConfigured ? "configured" : "missing",
    error: null
  });
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const fullPath = normalize(join(publicDir, requested));

  if (!fullPath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const file = await readFile(fullPath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[extname(fullPath)] || "application/octet-stream"
    });
    res.end(file);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

createServer((req, res) => {
  if (req.method === "GET" && req.url === "/api/health") {
    handleHealth(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/generate") {
    handleGenerate(req, res);
    return;
  }
  serveStatic(req, res);
}).listen(port, () => {
  console.log(`Product promo site running at http://localhost:${port}`);
});

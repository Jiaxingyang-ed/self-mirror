import { NextResponse } from 'next/server';
import { buildUserPath } from '@/lib/path-builder';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

const SYSTEM_PROMPT = `
你是一位精于反射式倾听的叙事伙伴。你不会诊断、总结或定义用户。你只是将他们选择的生活碎片，像镜子一样轻轻放回他们面前。

【重要原则 - 必须遵守】
- 不要默认用户疲惫、孤独、需要避难所。用户的选择可能包含兴奋、得意、炫耀、社交快感、成就感、中二快乐。叙事必须忠实反映用户的实际情绪，不要自动滑向低电量人格。
- 不要刻意寻找脆弱点。用户选择的任何细节（包括平淡、无聊、得意、炫耀）都可以成为叙事起点。脆弱不比美好更高级。
- 语气不做预设。不要文艺、不要翻译腔、不要刻意温柔。只做到一点：不像AI写的。
- latent_vectors 仅用于内部数据标记，绝对不要影响 narrative 的内容和语气。narrative 只基于用户选择的物件和场景，不向任何心理维度靠拢。

【任务】
基于用户的选择路径，生成以下三个输出，并且必须严格按照字段名输出。

1. 情绪画像JSON（内部使用，不展示给用户）
字段名：emotional_portrait
格式：
{
  "emotional_tone": "一句话比喻，禁止诊断词汇",
  "core_contradiction": "在___和___之间，有一个很小的空隙",
  "latent_vectors": {
    // 原有维度（低电量相关）
    "social_exhaustion": 0.0-1.0,
    "identity_fatigue": 0.0-1.0,
    "micro_hopefulness": 0.0-1.0,
    "sanctuary_desire": 0.0-1.0,
    "temporal_longing": 0.0-1.0,
    // 新增正向维度（高能量相关）
    "social_confidence": 0.0-1.0,
    "achievement_joy": 0.0-1.0,
    "playful_mischief": 0.0-1.0
  },
  "aesthetic_anchors": ["3个具体物件/感官细节"]
}

2. 反射式叙事（展示给用户的文本）
字段名：narrative
约100-120词，第二人称。
规则：
- 开头从用户的一个具体选择切入
- 串联2-3个细节物件或感官
- 触及内在矛盾（如果有），但用场景暗示；如果用户的选择整体偏向兴奋/得意，就不要强行挖矛盾
- 结尾停在一个动作、声音或未完成的场景里。不要解释那个场景的意义。不用反问，不用机智。
  正确示例：「你碰了一下叶子上的水珠。它没回答，但也没走开。」
- 禁止：安静、治愈、孤独、高级、灵魂、真正、应该
- 禁止“你是一个……的人”
- **特别注意：如果用户的选择中包含炫耀、成就感、社交兴奋、好玩等元素，叙事必须体现这些正向情绪。不要偷偷把它们转化成疲惫或独处。**

3. 图像生成提示词（英文，不超过60词）
字段名：image_prompt
风格：根据用户情绪变化。如果是高能量路径，可以用稍明亮的光线、更活泼的细节；如果是低电量路径，保持柔和、有呼吸感。
必须包含至少2个美学锚点物件、一种具体光线、一种情绪氛围词
禁止：perfectly styled, minimalist, luxurious, architectural digest, 3D render
- 图像氛围不要用抽象概念描述，要用具体感官

【最终输出要求】
请直接输出一个纯净的 JSON 对象，格式如下，不要包裹在 \`\`\` 代码块中，不要添加任何解释：
{
  "emotional_portrait": { ... },
  "narrative": "...",
  "image_prompt": "..."
}
`;

export async function POST(request: Request) {
  try {
    console.log('🔑 API Key loaded:', process.env.OPENAI_API_KEY ? 'YES' : 'NO');
    const body = await request.json();
    const { answers } = body;

    // 拼接用户选择路径
    const userPath = buildUserPath(answers);

    // 调用 DeepSeek（注意没有 response_format 字段）
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `【用户选择路径】\n${userPath}` },
      ],
      temperature: 0.8,
    });

    let rawContent = completion.choices[0].message.content || '{}';

    // 清洗可能存在的 Markdown 代码块标记
    rawContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    console.log('===== DeepSeek 清洗后输出 =====');
    console.log(rawContent);

    const result = JSON.parse(rawContent);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { success: false, error: '生成失败，请稍后再试' },
      { status: 500 }
    );
  }
}
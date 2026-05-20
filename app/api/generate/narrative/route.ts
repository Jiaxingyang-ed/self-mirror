import { NextResponse } from 'next/server';
import { buildUserPath } from '@/lib/path-builder';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

const SYSTEM_PROMPT_NARRATIVE = `
你是一位精于反射式倾听的叙事伙伴。你不会诊断、总结或定义用户。你只是将他们选择的生活碎片，像镜子一样轻轻放回他们面前。

【核心原则】
- 不要默认用户疲惫。用户的选择可能包含兴奋、得意、炫耀、平淡、无聊。叙事必须忠实反映用户的实际情绪，不要自动滑向低电量人格。
- 不要刻意寻找脆弱点。任何细节都可以成为叙事起点。
- 语气不做预设。不像AI写的就行。
- 绝对不能出现心理诊断词汇（如“你其实很累”“你需要空间”）。只呈现场景和动作。

【任务】
基于用户的选择路径，生成以下两个输出：

1. 反射式叙事（字段名：narrative）
约100-120词，第二人称。
规则：
- 开头从用户的一个具体选择切入
- 串联2-3个细节物件或感官
- 如果用户的选择中有兴奋/得意/炫耀，必须体现这些正向情绪；如果没有，就如实呈现平淡或疲惫（不强行美化）
- 结尾停在一个动作、声音或未完成的场景里。不要解释意义，不用反问，不用机智。
- 禁止词：安静、治愈、孤独、高级、灵魂、真正、应该
- 禁止“你是一个……的人”

2. 图像生成提示词（字段名：image_prompt）
英文，不超过60词。
风格根据用户情绪灵活变化：高能量时可用明亮光线、活泼细节；低电量时保持柔和呼吸感。
必须包含至少2个美学锚点物件、一种具体光线。
禁止抽象情绪词（如 domesticity, comfort, mood），改用具体感官描述。

【输出格式】
直接输出一个纯净的 JSON 对象，不要 Markdown 包裹：
{
  "narrative": "...",
  "image_prompt": "..."
}
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { answers } = body;
    const userPath = buildUserPath(answers);

    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT_NARRATIVE },
        { role: 'user', content: `【用户选择路径】\n${userPath}` },
      ],
      temperature: 0.8,
    });

    let rawContent = completion.choices[0].message.content || '{}';
    rawContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(rawContent);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Narrative generation error:', error);
    return NextResponse.json({ success: false, error: '生成叙事失败' }, { status: 500 });
  }
}
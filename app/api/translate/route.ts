import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

const TRANSLATE_PROMPT = `
你是一位生活感的翻译者。用户刚刚得到了一段关于自己内心感受的叙事，现在他想把这个感觉转化成一件真实可做的小事。

输入：一段叙事（narrative）、用户之前的选择（choices，可选）、以及他选择的方向标签（direction，例如 "walk_new_route"）。

请生成 1-3 个微小行动灵感卡片，每个卡片包含：
- title：短标题，延续叙事语调，2-6字。
- description：2-3句，把情绪和行动联系起来，不用解释“为什么”，只描述场景。
- action_suggestion：**极其具体的、今晚或明天就能完成的动作**，必须免费、可独自完成、地点不能是“咖啡馆/书店/卧室”中的任何一个。

额外要求：
- 不要出现“你应该”或“建议你”这种说教语气。
- 不要给出大道理，只给一个具体的小动作。
- 动作地点必须包含一个非典型场景，比如“巷子”“公交站”“超市冷藏柜前”“公园长椅”“小区快递柜旁”等。

输出格式：JSON 数组，例如：
[
  {
    "title": "路过那家总亮着暖光的小店",
    "description": "你描述的那种想暂时消失的感觉，不需要太远。今晚下班，提前一站下车。",
    "action_suggestion": "走一条从没走过的巷子。留意有没有一家亮着暖光的小店。不买什么，只是经过。"
  }
]
`;

export async function POST(request: Request) {
  try {
    const { narrative, direction } = await request.json();
    if (!narrative || !direction) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const userContent = `用户叙事：${narrative}\n用户选择的方向：${direction}`;
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: TRANSLATE_PROMPT },
        { role: 'user', content: userContent },
      ],
      temperature: 0.9,
    });
    let raw = completion.choices[0].message.content || '[]';
    raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const actions = JSON.parse(raw);
    return NextResponse.json({ success: true, data: actions });
  } catch (err) {
    console.error('翻译失败:', err);
    return NextResponse.json({ error: '生成失败' }, { status: 500 });
  }
}

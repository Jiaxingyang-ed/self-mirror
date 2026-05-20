import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

const SYSTEM_PROMPT_INSIGHTS = `
你是一位情绪分析专家。根据用户的选择路径和已生成的叙事文本，提取以下情绪特征值（0.0-1.0）。

【维度定义】
- social_exhaustion: 社交疲惫程度
- identity_fatigue: 身份疲劳
- micro_hopefulness: 微小希望感
- sanctuary_desire: 对安全空间的渴望
- temporal_longing: 对过去的怀念
- social_confidence: 社交自信
- achievement_joy: 成就感快乐
- playful_mischief: 玩心/中二/恶趣味

【输出格式】
只输出一个 JSON 对象，不要任何额外文本：
{
  "social_exhaustion": 0.0,
  "identity_fatigue": 0.0,
  "micro_hopefulness": 0.0,
  "sanctuary_desire": 0.0,
  "temporal_longing": 0.0,
  "social_confidence": 0.0,
  "achievement_joy": 0.0,
  "playful_mischief": 0.0
}
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { answers, narrative } = body;
    const answersSummary = Object.entries(answers)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    const userContent = `用户选择：${answersSummary}\n\n生成的叙事：\n${narrative}`;

    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT_INSIGHTS },
        { role: 'user', content: userContent },
      ],
      temperature: 0.3,
    });

    let raw = completion.choices[0].message.content || '{}';
    raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const vectors = JSON.parse(raw);

    return NextResponse.json({ success: true, data: vectors });
  } catch (error) {
    console.error('Insights extraction error:', error);
    return NextResponse.json({ success: false, error: '提取情绪特征失败' }, { status: 500 });
  }
}
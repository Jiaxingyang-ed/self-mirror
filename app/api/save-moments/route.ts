import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { userId, narrative, choices, imagePrompt, insights } = await request.json();

    if (!userId || !narrative || !choices) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ error: '服务器配置错误' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('saved_moments')
      .insert([
        {
          user_id: userId,
          narrative,
          choices,
          image_prompt: imagePrompt,
          insights,
        }
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('保存失败:', err);
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseServer } from '@/lib/supabase-server';
import { generateReportLimiter, getIP } from '@/lib/rate-limit';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  const ip = getIP(request);
  const { success } = await generateReportLimiter.limit(ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error } = await supabaseServer.auth.getUser(token);
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, mainAnswers, topClusters, followupAnswers } = await request.json();
    if (!userId || userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Your existing long prompt for the follow‑up report
    const prompt = `...`; // (keep your existing prompt)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a career counselor AI.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    });

    const report = completion.choices[0]?.message?.content || 'Unable to generate report.';

    const { error: dbError } = await supabaseServer.from('ai_followup_reports').insert({
      user_id: userId,
      report,
      top_clusters: topClusters,
      followup_answers: followupAnswers,
    });

    if (dbError) throw dbError;
    return NextResponse.json({ report });
  } catch (err: any) {
    console.error(err);
    const response = { error: 'Internal server error' };
    if (process.env.NODE_ENV === 'development') response.stack = err.stack;
    return NextResponse.json(response, { status: 500 });
  }
}
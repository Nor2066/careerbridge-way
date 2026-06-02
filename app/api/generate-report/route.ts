import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseServer } from '@/lib/supabase-server';
import { getAuthenticatedUser } from '@/lib/supabase-server-auth';
import { generateReportLimiter, getIP } from '@/lib/rate-limit';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const ip = getIP(request);
  const { success } = await generateReportLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, answers, rawScores, topClusters } = await request.json();
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ... (your existing prompt for the first AI report) ...

    const completion = await openai.chat.completions.create({ ... });
    const report = completion.choices[0]?.message?.content || 'Unable to generate report.';

    // Save to ai_main_reports (if you have that table)
    const { error } = await supabaseServer.from('ai_main_reports').insert({
      user_id: userId,
      report,
      top_clusters: topClusters,
    });
    if (error) throw error;

    return NextResponse.json({ report });
  } catch (error: any) {
    console.error('AI error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
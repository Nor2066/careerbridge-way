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

    const prompt = `
You are a career guidance AI. Write a friendly, personalized career report (max 400 words) based on the user's assessment.

**Top career clusters (with match %):**
${topClusters.map((c: any) => `- ${c.cluster}: ${c.percentage}%`).join('\n')}

**Their answers to open-ended questions:**
- Dream job: "${answers.dreamJob || 'Not provided'}"
- Top values in a career: "${answers.topValues || 'Not provided'}"
- Fulfilling project: "${answers.fulfillingProject || 'Not provided'}"
- Past career considerations: "${answers.pastConsiderations || 'Not provided'}"

**Preferences:**
- Salary aim: ${answers.salaryAim || 'Not provided'}
- Relocation: ${answers.relocateWillingness || 'Not provided'}
- Remote work: ${answers.remoteWork || 'Not provided'}
- Work schedule: ${answers.workSchedule || 'Not provided'}
- Job security: ${answers.jobSecurity || 'Not provided'}
- Travel: ${answers.travelPreference || 'Not provided'}
- Team environment: ${answers.teamEnvironment || 'Not provided'}
- Handling criticism: ${answers.criticismHandling || 'Not provided'}

Write a warm, encouraging report. For each of the top 3 clusters, explain why the user fits there based on their answers.
Do NOT list specific job titles or give concrete next steps. Instead, end the report by inviting the user to take a short follow‑up questionnaire that will provide even more personalized advice about their top clusters.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful career counselor AI. Provide accurate, actionable advice.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const report = completion.choices[0]?.message?.content || 'Unable to generate report.';

    // Save to ai_main_reports (create table if not exists)
    const { error } = await supabaseServer.from('ai_main_reports').insert({
      user_id: userId,
      report,
      top_clusters: topClusters,
    });
    if (error) console.error('Failed to save main AI report:', error);

    return NextResponse.json({ report });
  } catch (error: any) {
    console.error('AI error:', error);
    const response: { error: string; stack?: string } = { error: 'Internal server error' };
    if (process.env.NODE_ENV === 'development') {
      response.stack = error.stack;
    }
    return NextResponse.json(response, { status: 500 });
  }
}
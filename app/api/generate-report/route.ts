import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseServer } from '@/lib/supabase-server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { userId, answers, rawScores, topClusters } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Save the report to the database
    const { error } = await supabaseServer.from('ai_main_reports').insert({
      user_id: userId,
      report,
      top_clusters: topClusters,
    });

    if (error) {
      console.error('Failed to save AI report:', error);
      // Continue anyway – we still return the report to the user
    }

    return NextResponse.json({ report });
  } catch (error: any) {
    console.error('OpenAI error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
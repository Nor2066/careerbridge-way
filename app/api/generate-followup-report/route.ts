console.log('✅ generate-followup-report API route loaded');
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
console.log('📨 Request received, method:', request.method);
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

    const prompt = `
You are a career guidance AI. The user has already completed a main career assessment and a detailed follow‑up questionnaire for their top clusters.

**First AI report summary (you previously wrote a warm, encouraging report):**  
You explained why the user fits their top clusters and invited them to take this follow‑up. Now you have their detailed answers.

**User's top career clusters (with match %):**
${topClusters.map((c: any) => `- ${c.cluster}: ${c.percentage}%`).join('\n')}

**Main assessment data (recap):**
- Dream job: "${mainAnswers.dreamJob || 'Not provided'}"
- Top values: "${mainAnswers.topValues || 'Not provided'}"
- Fulfilling project: "${mainAnswers.fulfillingProject || 'Not provided'}"
- Past considerations: "${mainAnswers.pastConsiderations || 'Not provided'}"
- Salary aim: ${mainAnswers.salaryAim || 'Not provided'}
- Relocation: ${mainAnswers.relocateWillingness || 'Not provided'}
- Remote work: ${mainAnswers.remoteWork || 'Not provided'}
- Work schedule: ${mainAnswers.workSchedule || 'Not provided'}
- Job security: ${mainAnswers.jobSecurity || 'Not provided'}
- Travel: ${mainAnswers.travelPreference || 'Not provided'}
- Team environment: ${mainAnswers.teamEnvironment || 'Not provided'}
- Handling criticism: ${mainAnswers.criticismHandling || 'Not provided'}

**Follow‑up questionnaire answers (per cluster):**
${Object.entries(followupAnswers).map(([cluster, qa]) => {
  const answers = qa as Record<number, string>;
  const answerLines = Object.entries(answers).map(([qIdx, ans]) => `  Q${Number(qIdx)+1}: ${ans}`).join('\n');
  return `${cluster}:\n${answerLines}`;
}).join('\n\n')}

**Your task:**
Write a detailed, personalized career roadmap (500-700 words). Do not repeat the basic cluster explanations from the first report. Instead, use the follow‑up answers to drill down into specific sub‑fields, job titles, required skills, certifications, and actionable next steps.

For each of the top clusters, provide:
- 2-3 concrete job titles (e.g., "UX researcher" instead of just "Analytical")
- Recommended online courses, certifications, or learning paths
- Suggestions for gaining experience (internships, side projects, volunteering)
- How the user's preferences (salary, remote work, team environment) align with realistic opportunities

Also include a short summary of how the user's values and past experiences (from the main assessment) connect to these recommendations.

End with a "Your next 3 months" action plan (3 bullet points).
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a career counselor AI. Provide specific, actionable, and encouraging advice. Use concrete examples.' },
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
    const response: { error: string; stack?: string } = { error: 'Internal server error' };
    if (process.env.NODE_ENV === 'development') {
      response.stack = err.stack;
    }
    return NextResponse.json(response, { status: 500 });
  }
}
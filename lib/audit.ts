
// Fail fast if this module is ever pulled into a client bundle. Next.js does
// not inline non-NEXT_PUBLIC env vars into browser code, so the service-role
// key cannot leak this way — but it would arrive as undefined and produce a
// confusing runtime 403 instead of an obvious error. lib/supabase-server.ts
// has guarded this way for a while; these modules did not.
if (typeof window !== 'undefined') {
  throw new Error('This module is server-only and must not be imported by client code');
}

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type AuditAction =
  | 'login'
  | 'logout'
  | 'assessment_submitted'
  | 'report_generated'
  | 'followup_report_generated'
  | 'progress_saved'
  | 'result_saved'
  | 'admin_viewed_assessments'
  | 'admin_login';

interface AuditOptions {
  userId: string | null;
  action: AuditAction;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export async function logAudit({
  userId,
  action,
  metadata = {},
  ipAddress,
}: AuditOptions): Promise<void> {
  try {
    await supabaseAdmin.from('audit_logs').insert({
      user_id: userId,
      action,
      metadata,
      ip_address: ipAddress,
    });
  } catch (err) {
    // Audit logging should never crash the main request
    // Log to Sentry instead so we know if audit logging breaks
    console.error('Audit log failed:', err);
  }
}
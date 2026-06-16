
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

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

// Call this in an API route — never in a client component
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresInSeconds = 3600
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data) throw new Error('Could not generate signed URL');
  return data.signedUrl;
}
// Keeps the Supabase project from being paused for inactivity.
//
// Why this exists in addition to .github/workflows/supabase-keepalive.yml:
// GitHub disables scheduled workflows on any repository with no commits for 60
// days, silently. A finished client site stops getting commits, the workflow
// stops running, and the first anyone hears about it is a dead chat widget. A
// Vercel cron is tied to the deployment rather than repo activity, so it keeps
// running for as long as the site is deployed.
//
// Requires these Vercel environment variables (Settings -> Environment Variables):
//   SUPABASE_URL          https://<project-ref>.supabase.co
//   SUPABASE_ANON_KEY     the publishable / anon key
//   CRON_SECRET           optional; Vercel sends it as a Bearer token if set

export default async function handler(request, response) {
  const cronSecret = process.env.CRON_SECRET;

  // Vercel sends `Authorization: Bearer $CRON_SECRET` on scheduled invocations.
  // Set the secret to stop anyone else from calling this endpoint.
  if (cronSecret) {
    const authorization = request.headers.authorization || '';
    if (authorization !== `Bearer ${cronSecret}`) {
      return response.status(401).json({ ok: false, message: 'Unauthorized.' });
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response.status(500).json({
      ok: false,
      message: 'SUPABASE_URL and SUPABASE_ANON_KEY must be set as Vercel environment variables.'
    });
  }

  const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/knowledge_base?select=id&limit=1`;

  try {
    const started = Date.now();
    const result = await fetch(endpoint, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      }
    });

    const durationMs = Date.now() - started;

    if (!result.ok) {
      const detail = await result.text().catch(() => 'unknown error');
      // A paused project answers with an error rather than data. Fail loudly so
      // the run shows up as failed in the Vercel dashboard instead of passing
      // quietly while the database is down.
      console.error(`[keepalive] Supabase returned ${result.status}: ${detail}`);
      return response.status(502).json({
        ok: false,
        status: result.status,
        message: 'Supabase did not respond normally. The project may be paused.'
      });
    }

    console.log(`[keepalive] Supabase responded in ${durationMs}ms`);
    return response.status(200).json({ ok: true, durationMs });
  } catch (error) {
    console.error('[keepalive] Request failed', error);
    return response.status(502).json({ ok: false, message: 'Could not reach Supabase.' });
  }
}

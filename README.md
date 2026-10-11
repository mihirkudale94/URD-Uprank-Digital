# URD Up Rank Digital

Production website for Up Rank Digital, built with Vite, React, and Supabase.
Vercel serves the built static site; Supabase stores contact leads and backs the
AI assistant.

## Local Commands

```bash
npm install
npm run dev
npm test
npm run build
```

## Contact Backend

The contact form submits to Supabase:

```text
React form -> Supabase -> public.leads
```

If `VITE_SUPABASE_LEAD_FUNCTION=submit-lead` is set, the form calls the Supabase Edge Function instead:

```text
React form -> Supabase Edge Function -> public.leads -> optional Resend email
```

Recommended production setup:

1. Create a Supabase project.
2. Run the Supabase migrations in Supabase SQL Editor, **in this order**. They are
   not optional: `202609010002` is what makes the contact form's service
   selections pass the row level security policy, and the knowledge base
   migrations back the chat assistant's retrieval.

   - `supabase/migrations/202606290001_create_leads.sql`
   - `supabase/migrations/202606300001_create_chatbot_leads.sql`
   - `supabase/migrations/202607030001_create_knowledge_base.sql`
   - `supabase/migrations/202609010001_reset_knowledge_base.sql`
   - `supabase/migrations/202609010002_align_lead_services.sql`

3. Add these browser-safe Vite env values:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_LEAD_FUNCTION=submit-lead
VITE_SUPABASE_CHAT_FUNCTION=chat
```

4. Deploy the optional Edge Function if email notifications are needed:

```bash
supabase functions deploy submit-lead
```

5. Set Edge Function secrets in Supabase:

```bash
supabase secrets set CONTACT_ALLOWED_ORIGINS=https://uprankdigital.com,https://www.uprankdigital.com
supabase secrets set CONTACT_RECIPIENT=sachin@uprankdigital.com
supabase secrets set RESEND_API_KEY=...
supabase secrets set RESEND_FROM_EMAIL="Up Rank Digital <leads@uprankdigital.com>"
```

Do not put service role keys or email API keys in React/Vite env variables.

## AI Assistant Backend

The website assistant streams from the `chat` Edge Function, which calls Cerebras and
grounds answers in the `knowledge_base` table.

```bash
supabase functions deploy chat
supabase secrets set CHAT_ALLOWED_ORIGINS=https://uprankdigital.com,https://www.uprankdigital.com
supabase secrets set CEREBRAS_API_KEY=...
supabase secrets set CEREBRAS_MODEL=llama3.1-8b
```

`CEREBRAS_MODEL` must name a model your Cerebras account can serve. If the call fails
for any reason the function streams a contact-details fallback flagged with
`urd_fallback`, and the browser swaps in a local service-matching reply, so the
assistant degrades gracefully rather than erroring.

If `VITE_SUPABASE_URL` is unset the assistant runs fully offline against the local
service playbook in `src/utils/servicePlaybook.js`.

## Deployment (Vercel)

The site is hosted on Vercel. `vercel.json` already sets the build, the cron job,
the `/privacy-policy` rewrite and security headers, so the dashboard needs almost
nothing configured by hand.

1. **Import the repository** in the Vercel dashboard. The framework is detected as
   Vite; build command `npm run build`, output directory `dist`.

2. **Add environment variables** (Settings -> Environment Variables), for
   Production and Preview:

   | Variable | Used by | Notes |
   | --- | --- | --- |
   | `VITE_SUPABASE_URL` | browser | Build-time |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | browser | Build-time |
   | `VITE_SUPABASE_LEAD_FUNCTION` | browser | `submit-lead` |
   | `VITE_SUPABASE_CHAT_FUNCTION` | browser | `chat` |
   | `VITE_GTM_ID` *or* `VITE_GA_MEASUREMENT_ID` | browser | Analytics; build-time |
   | `SUPABASE_URL` | keepalive cron | Server-side only |
   | `SUPABASE_ANON_KEY` | keepalive cron | Server-side only |
   | `CRON_SECRET` | keepalive cron | Optional but recommended |

   Everything prefixed `VITE_` is **baked in at build time**. Changing one needs a
   redeploy, not just a save.

3. **Add the domain** and point DNS at Vercel. Set
   `CONTACT_ALLOWED_ORIGINS` and `CHAT_ALLOWED_ORIGINS` in Supabase to the final
   domain, or the Edge Functions will reject the browser's requests.

Every push to `main` deploys. Pull requests get preview deployments.

## Supabase Keeps Pausing

Free-plan Supabase projects pause after roughly a week of inactivity, which takes
the chat assistant and the lead form down with them.

**The only supported fix is the Supabase Pro plan.** Nothing below is guaranteed;
they reduce the chance of hitting the inactivity window, they do not remove it.

There are two independent keepalives in this repo, deliberately:

1. **Vercel cron** (`api/keepalive.js`, scheduled in `vercel.json`) runs daily and
   reads one row from `knowledge_base`. **This is the primary one.** It needs
   `SUPABASE_URL` and `SUPABASE_ANON_KEY` set in Vercel.

2. **GitHub Actions** (`.github/workflows/supabase-keepalive.yml`) runs every third
   day as a backup. It needs the `SUPABASE_PROJECT_ID` and `SUPABASE_ANON_KEY`
   repository secrets.

**If it paused anyway, check these in order:**

- **The GitHub workflow was silently disabled.** GitHub turns off scheduled
  workflows on any repository with no commits for 60 days. A finished client site
  stops getting commits, so this is the most common cause. Re-enable it from the
  Actions tab. The Vercel cron does not have this failure mode, which is why it is
  now the primary.
- **The secrets were never set.** Both jobs fail immediately without them. Check
  the Actions tab and the Vercel cron logs for failed runs.
- **The project is already paused.** Neither job can wake it. Restore it from the
  Supabase dashboard first, then the keepalives hold it open.
- **Verify the cron is live:** Vercel dashboard -> the project -> Cron Jobs. You can
  also hit `/api/keepalive` directly; it returns `{"ok":true}` when the database
  responded.

Vercel's Hobby plan runs cron jobs once per day, which is well inside the pause
window. If the project still pauses with both keepalives confirmed running, that is
the point to move to Pro.

## Analytics

The assistant and contact form already emit events (`chatbot_opened`,
`message_sent`, `reply_received`, `chat_cleared`). They go nowhere until a tag is
configured, so set **one** of these in Vercel and redeploy:

```bash
VITE_GTM_ID=GTM-XXXXXXX           # preferred if the client already uses Tag Manager
VITE_GA_MEASUREMENT_ID=G-XXXXXXX  # plain GA4, no container
```

- Leave both blank and no tracking script is requested at all.
- Setting both is a misconfiguration: a container almost always carries its own
  GA4 tag, so every event would be counted twice. Tag Manager wins and a warning
  is logged.
- A malformed ID is rejected with a console warning rather than loading a broken tag.
- Read at **build time**. Changing one needs a redeploy.
- `reply_received` carries a `reply_source` of `model`, `backend_fallback`,
  `local_error` or `local_unconfigured`, so a degraded assistant is visible in
  reporting rather than just missing.

Two `CustomEvent`s (`urd-assistant-event` and `urd:analytics`) are always
dispatched on `window`, whether or not a tag is configured.

## Pre-Deployment Checklist

- [ ] All five migrations applied, in order.
- [ ] `npm run build` succeeds and `dist/` is the published folder.
- [ ] Vite env vars set in Vercel (read at build time — redeploy after changing them).
- [ ] Edge Function secrets set in Supabase, including the allowed-origin lists for the live domain.
- [ ] Submit a real test lead and confirm it lands in `public.leads` and triggers the notification email.
- [ ] Open the assistant and confirm it answers from the model rather than the fallback message.
- [ ] Set `VITE_GTM_ID` **or** `VITE_GA_MEASUREMENT_ID`, redeploy, then confirm `chatbot_opened` arrives in GA4 Realtime or GTM Preview.
- [ ] `public/sitemap.xml` lists only pages that exist, and is submitted in Search Console.
- [ ] `/privacy-policy` loads, and the footer link reaches it.
- [ ] Vercel cron shows a successful `/api/keepalive` run.
- [ ] Client brand names filled into `src/data/clientLogos.js`, or left blank deliberately.

## Production Notes

- Vercel hosts the static React app; Supabase handles leads.
- `vite.config.js` sets `base: '/'`: the site is served from the domain root, and
  `/privacy-policy` is a nested path that a relative base would resolve wrongly.
- The build has no router: the site is one page and every link is an in-page anchor.
- The public Supabase key is safe for the browser only when RLS policies are enabled.
- The migration enables RLS and allows public insert-only access to valid leads.
- Email notification should run from the Supabase Edge Function or an automation, never directly from React.
- Analytics is wired and inert until an ID is set; see the Analytics section above.
- `public/privacy.html` is served at `/privacy-policy` via a rewrite in
  `vercel.json`, and is linked from the footer. It describes what the site
  actually does. **Have it reviewed by a lawyer before launch**: it is an accurate
  description of the system, not legal advice, and India's DPDP Act may require a
  named grievance officer that is not in it.

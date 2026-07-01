# URD Up Rank Digital

Production website for Up Rank Digital, built with Vite, React, and Supabase. BigRock serves the built static site; Supabase stores contact leads.

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
2. Run the Supabase migrations in Supabase SQL Editor:
   - `supabase/migrations/202606290001_create_leads.sql`
   - `supabase/migrations/202606300001_create_chatbot_leads.sql`
3. Add these browser-safe Vite env values:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_LEAD_FUNCTION=submit-lead
```

4. Deploy the optional Edge Function if email notifications are needed:

```bash
supabase functions deploy submit-lead
supabase functions deploy request-voice-call
```

5. Set Edge Function secrets in Supabase:

```bash
supabase secrets set CONTACT_ALLOWED_ORIGINS=https://uprankdigital.com,https://www.uprankdigital.com
supabase secrets set CONTACT_RECIPIENT=sachin@uprankdigital.com
supabase secrets set RESEND_API_KEY=...
supabase secrets set RESEND_FROM_EMAIL="Up Rank Digital <leads@uprankdigital.com>"
supabase secrets set VOICE_ALLOWED_ORIGINS=https://uprankdigital.com,https://www.uprankdigital.com
supabase secrets set ELEVENLABS_API_KEY=...
supabase secrets set ELEVENLABS_AGENT_ID=...
supabase secrets set ELEVENLABS_CALL_PROVIDER=exotel
supabase secrets set ELEVENLABS_AGENT_PHONE_NUMBER_ID=...
supabase secrets set ELEVENLABS_WHATSAPP_PHONE_NUMBER_ID=...
supabase secrets set ELEVENLABS_WHATSAPP_TEMPLATE_NAME=...
supabase secrets set ELEVENLABS_WHATSAPP_TEMPLATE_LANGUAGE_CODE=en
```

Do not put service role keys or email API keys in React/Vite env variables.

## AI Voice Backend

Outbound AI voice requests use Supabase Edge Functions only:

```text
React chatbot -> Supabase Edge Function -> ElevenLabs mobile outbound call
```

No PHP or Twilio endpoint is used. The browser only sends the lead's mobile number to `request-voice-call`; ElevenLabs API credentials and telephony provider details stay in Supabase secrets.

Set `ELEVENLABS_CALL_PROVIDER=exotel` for India-friendly mobile calling through an ElevenLabs-connected Exotel number. Use `sip_trunk` only if you already have your own SIP trunk. Use `whatsapp` only when you intentionally want WhatsApp permission-request calling instead of a normal mobile call.

Chatbot callback and AI voice handoff records are stored in `public.chatbot_leads`. The table is insert-only for public users through RLS and requires explicit consent for AI voice callback records.

See `docs/ai-agent-production-guide.md` for the voice-agent script, analytics events, launch checklist, and handoff rules.

## BigRock Deployment

BigRock only needs to serve the built React files.

1. Copy `.env.example` to `.env` locally and fill the real values.
2. In BigRock/cPanel, confirm the hosting document root. For the main domain it is usually `/public_html`.
3. Prefer FTPS if BigRock enables it for the account:
   - `FTP_HOST`: the host shown in BigRock/cPanel FTP details.
   - `FTP_USER`: the FTP or cPanel username.
   - `FTP_PASSWORD`: the matching password.
   - `FTP_REMOTE_PATH=/public_html`
   - `FTP_SECURE=true`
4. Run:

```bash
npm run deploy
```

The deploy script builds the Vite app and uploads the contents of `dist/`.

## Production Notes

- BigRock hosts the static React app; Supabase handles leads.
- The public Supabase key is safe for the browser only when RLS policies are enabled.
- The migration enables RLS and allows public insert-only access to valid leads.
- Email notification should run from the Supabase Edge Function or an automation, never directly from React.
- AI voice requests run through Supabase Edge Functions, so BigRock does not need PHP for this site.
- Connect chatbot analytics events to GTM/GA after launch to measure assistant-driven leads.

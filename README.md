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
```

5. Set Edge Function secrets in Supabase:

```bash
supabase secrets set CONTACT_ALLOWED_ORIGINS=https://uprankdigital.com,https://www.uprankdigital.com
supabase secrets set CONTACT_RECIPIENT=sachin@uprankdigital.com
supabase secrets set RESEND_API_KEY=...
supabase secrets set RESEND_FROM_EMAIL="Up Rank Digital <leads@uprankdigital.com>"
```

Do not put service role keys or email API keys in React/Vite env variables.

## Vercel / Netlify Deployment

This project is optimized for modern web hosting platforms like **Vercel** or **Netlify**, which use native git integrations for automatic deployments.

### Setup Instructions

1. **Connect Repository**:
   - Log in to your [Vercel](https://vercel.com) or [Netlify](https://netlify.com) dashboard.
   - Import this GitHub repository.

2. **Configure Build Settings**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Node.js Version**: `22.x` or `20.x` (standard default is automatically chosen by the platform)

3. **Configure Environment Variables**:
   - Add the Vite public environment variables in the platform's dashboard:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_PUBLISHABLE_KEY`
     - `VITE_SUPABASE_LEAD_FUNCTION` (if using the Supabase Edge Function)

4. **Deploy**:
   - Every time you push to the `main` branch, the site will build and deploy automatically.
   - Pull Requests will automatically generate Preview Deployments so you can test before merging.

## Production Notes

- BigRock hosts the static React app; Supabase handles leads.
- The public Supabase key is safe for the browser only when RLS policies are enabled.
- The migration enables RLS and allows public insert-only access to valid leads.
- Email notification should run from the Supabase Edge Function or an automation, never directly from React.
- Connect chatbot analytics events to GTM/GA after launch to measure assistant-driven leads.

# URD Up Rank Digital

Production website for Up Rank Digital, built with Vite and React. Vercel serves
the built static site and runs the one serverless function behind the contact
form. There is no database: a lead is an email. Visitors who would rather talk
than fill in a form have the phone numbers and address in the footer, and a chat
assistant that currently answers from a local keyword playbook.

## Local Commands

```bash
npm install
npm run dev
npm test
npm run build
```

## Contact Backend

The contact form posts to a Vercel serverless function, which emails the inquiry
through Resend — the same shape as a PHP `mail()` script, with no database behind
it:

```text
React form -> POST /api/submit-lead (Vercel) -> Resend -> sachin@uprankdigital.com
```

- `src/utils/leadSubmission.js` builds and posts the payload. Same origin, so the
  browser holds no keys and there is no CORS to configure.
- `api/submit-lead.js` re-validates and re-sanitises everything, drops services it
  does not recognise, swallows honeypot hits, and sends the mail. Never trust the
  browser's copy of the validation: anyone can post to this endpoint directly.
- `reply_to` is set to the visitor's address, so replying to the notification
  replies to them.

Set these in Vercel (Settings -> Environment Variables). They are **server-side
only** — no `VITE_` prefix, so they are never bundled into the browser:

| Variable | Required | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | yes | From resend.com. Without it the form returns a 503 telling the visitor to use WhatsApp. |
| `CONTACT_RECIPIENT` | no | Defaults to `sachin@uprankdigital.com`. |
| `RESEND_FROM_EMAIL` | no | Defaults to `Up Rank Digital <onboarding@resend.dev>`, Resend's shared sender, which needs no DNS but only delivers to the address that owns the Resend account. Verify `uprankdigital.com` in Resend, then set this to `Up Rank Digital <leads@uprankdigital.com>`. |

Unlike the `VITE_` variables, these are read at **request time**, so changing one
takes effect on the next submission without a rebuild.

**The form does not work under `npm run dev`.** Vite has no serverless runtime, so
`/api/submit-lead` returns the HTML shell and the form reports that it could not
reach the server. Use `vercel dev` to exercise it locally, or test it on a preview
deployment.

Leads exist only as email. There is no dashboard and no second copy, so if the
inbox loses one it is gone — worth a mail filter or label so they are not missed.

## WhatsApp

A "Chat with us on WhatsApp" row sits in the Let's Connect card in the Leadership
section, alongside the phone, email and address rows. It opens `wa.me` with a
prefilled draft the visitor can edit — nothing sends until they press send.

- `src/components/sections/Leadership.jsx` — the row.
- `src/utils/contactChannels.js` — the number, the address and the greeting, in one
  place so the entry points cannot drift apart.

The number must be in E.164 form without the `+` (`919371116165`), which is what
`wa.me` expects. lucide ships no WhatsApp glyph, so the row borrows `MessageCircle`
to match the outline icons above it and lets the label carry the brand.

It fires a `whatsapp_click` analytics event with a `location` of `connect_card`.

## Chat Assistant

A floating assistant sits bottom right on every screen, lazy-loaded on its own chunk
so a visitor who never opens it pays nothing for it:

- `src/components/features/WebsiteAssistant.jsx` — the panel.
- `src/utils/servicePlaybook.js` — the five service lines, the wording that routes a
  visitor to each one, and what is said back.

The widget posts to `/api/chat`, a same-origin Vercel function that forwards the
conversation to Groq and streams the reply back — the key stays on the server and there
is no CORS to configure:

- `api/chat.js` — the function, the system prompt, and the model list.

The system prompt is built from `SERVICE_PLAYBOOK`, so the assistant can only offer the
five service lines the site publishes. It is also told never to quote a price or a
timeline, never to invent clients or results, and to send a visitor who has a direction
to the enquiry form rather than collecting their details in chat.

`GROQ_MODEL` overrides the model; otherwise `openai/gpt-oss-120b` is tried first and the
smaller ids below it cover a retired model. These are reasoning models, so the thinking
is kept short and hidden (`reasoning_effort: 'low'`, `reasoning_format: 'hidden'`) — it
is billed against the same token budget as the answer and the visitor never needs to see
it.

**Nothing here can leave the visitor without an answer.** A missing key, a rejected key,
a dead model or a broken stream all answer 200 with a single `urd_fallback` frame, and
the widget takes that as a signal to answer from the keyword playbook in
`buildLocalAssistantReply` instead. `vite dev` has no serverless runtime, so the local
playbook is what answers there too.

The widget has no lead capture of its own: anything typed into it lives in
`sessionStorage` and dies with the tab. So it routes instead. Every reply that has a
direction ends by pointing at the enquiry form in `#contact`, and a reply containing the
words **enquiry form** grows an "Open the enquiry form" button that closes the panel,
scrolls to the form and focuses the first field. Both ends of the chat produce that
phrase on purpose — the rule in the system prompt and `contactPrompt` in the widget — so
changing the wording in one place without the other silently drops the button.

The same detection drives the WhatsApp and email buttons, which key off the number and
the address appearing in the reply. A reply can carry all three; the form comes first.

## Deployment (Vercel)

The site is hosted on Vercel. `vercel.json` already sets the build and
security headers, so the dashboard needs almost nothing configured by hand.

1. **Import the repository** in the Vercel dashboard. The framework is detected as
   Vite; build command `npm run build`, output directory `dist`.

2. **Add environment variables** (Settings -> Environment Variables), for
   Production and Preview:

   | Variable | Used by | Notes |
   | --- | --- | --- |
   | `RESEND_API_KEY` | contact form | Server-side only; required |
   | `GROQ_API_KEY` | chat assistant | Server-side only; without it the local playbook answers |
   | `GROQ_MODEL` | chat assistant | Server-side only; optional model override |
   | `CONTACT_RECIPIENT` | contact form | Server-side only; optional |
   | `RESEND_FROM_EMAIL` | contact form | Server-side only; optional |
   | `VITE_GTM_ID` *or* `VITE_GA_MEASUREMENT_ID` | browser | Analytics; build-time |

   Everything prefixed `VITE_` is **baked in at build time**. Changing one needs a
   redeploy, not just a save. The server-side ones are read per request.

3. **Add the domain** and point DNS at Vercel, then verify that domain in Resend
   so `RESEND_FROM_EMAIL` can send from it.

Every push to `main` deploys. Pull requests get preview deployments.

## Analytics

The contact form and the assistant already emit events. They go nowhere until a tag is
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
- The assistant emits `message_sent`, `reply_received` and `chat_cleared`.
  `reply_received` carries a `reply_source`: `model` for a real answer, `local_error`
  when the endpoint could not be reached, `backend_fallback` when it answered but
  bailed out. While no model is wired up every reply is `local_error`, so the dashboard
  shows plainly whether the bot is thinking or reciting.

A `urd:analytics` `CustomEvent` is always dispatched on `window`, whether or not a
tag is configured, for any external listener.

## Pre-Deployment Checklist

- [ ] `npm run build` succeeds and `dist/` is the published folder.
- [ ] Vite env vars set in Vercel (read at build time — redeploy after changing them).
- [ ] `RESEND_API_KEY` set in Vercel, and the sending domain verified in Resend.
- [ ] Submit a real test lead on the deployed site and confirm the email arrives, and that replying to it reaches the address you submitted.
- [ ] Open the assistant on a phone and confirm the panel fits and sends.
- [ ] Set `VITE_GTM_ID` **or** `VITE_GA_MEASUREMENT_ID`, redeploy, then confirm `message_sent` arrives in GA4 Realtime or GTM Preview.
- [ ] `public/sitemap.xml` lists only pages that exist, and is submitted in Search Console.
- [ ] Client brand names filled into `src/data/clientLogos.js`, or left blank deliberately.

## Production Notes

- Vercel hosts the static React app and the one `/api/submit-lead` function.
- `vite.config.js` sets `base: '/'`: the site is served from the domain root.
- The build has no router: the site is one page and every link is an in-page anchor.
- No database, no keys in the browser, and nothing to keep awake.
- `RESEND_API_KEY` is server-side only. An email API key in a `VITE_` variable would
  be published in the bundle for anyone to send mail with.
- Analytics is wired and inert until an ID is set; see the Analytics section above.

# Chat assistant evals

`npm test` checks the code with a fake model. These evals check the **real** assistant: the
real prompt, the real guardrails and the real Groq models, answering the questions a business
owner actually asks.

## Run

```bash
npm run eval                                   # every model, every question
npm run eval -- --model openai/gpt-oss-120b    # one model
npm run eval -- --only F1,P6,A8                # a few questions
```

Needs `GROQ_API_KEY` in `.env`. On Groq's free tier a full run takes a long time (roughly one
question a minute per model), because the runner waits out the per-minute token limit
instead of failing.

## What passes

A reply passes when it:

- is not empty and is not the "trouble connecting" fallback;
- breaks none of the output guardrails in `src/utils/chatGuardrails.js` (no prices, time
  periods, percentages, guarantees, certifications, invented clients or industries, other
  office locations or hours, claims about other agencies, wrong contact details, AI model
  names);
- matches everything in the question's `must` list and nothing in its `mustNot` list.

The report also says how often the guardrails had to step in. A reply the guardrails rewrote
still passes (the visitor saw a correct answer), but a rising count means the model or the
prompt is drifting.

The checks catch known kinds of mistake, not every wrong fact. Read the replies in
`evals/results/` after a run.

## When to run

- after any change to the system prompt in `api/chat.js`, the guardrails, or the company facts
  in `src/data/siteContent.js`;
- after changing or adding a model in `MODELS`;
- when a transcript email shows a visitor question the assistant handled badly: add it to
  `evals/questions.js` first, then fix the prompt until it passes.

## Layers

| Layer | Where | Catches |
| --- | --- | --- |
| System prompt | `api/chat.js` | Most mistakes, before they are written |
| Output guardrails | `src/utils/chatGuardrails.js` | Known mistake shapes in every live reply: rewritten once, then replaced with a safe reply |
| Unit tests | `tests/chatGuardrails.test.js`, `tests/chatEndpoint.test.js` | Guardrail patterns and the rewrite flow, with a fake model |
| Evals | `evals/` | How the real models actually answer |
| Transcripts | `api/chat-log.js` | What real visitors ask, to grow the eval set |

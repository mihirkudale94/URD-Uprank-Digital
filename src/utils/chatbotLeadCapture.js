import { isSupabaseConfigured, supabase } from './supabaseClient';

const cleanText = (value, maxLength = 500) =>
  String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);

const cleanSignals = (signals) => {
  if (Array.isArray(signals)) {
    return signals.map(signal => cleanText(signal, 80)).filter(Boolean).slice(0, 8);
  }

  return cleanText(signals, 300)
    .split(',')
    .map(signal => cleanText(signal, 80))
    .filter(Boolean)
    .slice(0, 8);
};

export const buildChatbotLeadPayload = ({
  phone,
  serviceInterest = 'General enquiry',
  intentSignals = [],
  transcriptSummary = '',
  notes = '',
  source = 'chatbot_callback',
  preferredChannel = 'human_callback',
  consentAccepted = false
}) => ({
  phone: cleanText(phone, 40),
  service_interest: cleanText(serviceInterest, 160) || 'General enquiry',
  intent_signals: cleanSignals(intentSignals),
  transcript_summary: cleanText(transcriptSummary, 3000),
  notes: cleanText(notes, 1200),
  page_url: typeof window !== 'undefined' ? window.location.href.slice(0, 500) : '',
  source,
  preferred_channel: preferredChannel,
  user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 500) : '',
  consent_accepted: Boolean(consentAccepted),
  status: 'new'
});

export const submitChatbotLead = async (leadPayload) => {
  if (!isSupabaseConfigured) {
    return { success: false, skipped: true, message: 'Supabase is not configured.' };
  }

  const { error } = await supabase
    .from('chatbot_leads')
    .insert([leadPayload]);

  if (error) {
    throw new Error(error.message || 'Chatbot lead submission failed.');
  }

  return { success: true };
};

export const captureChatbotLead = async (leadInput) => {
  const leadPayload = buildChatbotLeadPayload(leadInput);
  return submitChatbotLead(leadPayload);
};

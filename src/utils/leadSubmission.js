import { isSupabaseConfigured, supabase } from './supabaseClient';

const LEAD_FUNCTION_NAME = import.meta.env.VITE_SUPABASE_LEAD_FUNCTION || '';

const cleanText = (value, maxLength = 500) =>
  String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);

const normalizeUrl = (value) => {
  const raw = cleanText(value, 300);
  if (!raw) return '';

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const parsed = new URL(withProtocol);
    if (!['http:', 'https:'].includes(parsed.protocol)) return '';
    return parsed.toString().slice(0, 300);
  } catch {
    return '';
  }
};

export const buildLeadPayload = ({ formData, selectedServices }) => ({
  name: cleanText(formData.name, 120),
  email: cleanText(formData.email, 254).toLowerCase(),
  phone: cleanText(formData.phone, 40),
  business_name: cleanText(formData.businessName, 160),
  website_url: normalizeUrl(formData.url),
  message: cleanText(formData.message, 3000),
  services: selectedServices,
  page_url: window.location.href,
  source: 'website_contact_form',
  user_agent: navigator.userAgent
});

export const submitLead = async (leadPayload) => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured yet. Please add your Supabase URL and publishable key.');
  }

  if (LEAD_FUNCTION_NAME) {
    const { data, error } = await supabase.functions.invoke(LEAD_FUNCTION_NAME, {
      body: leadPayload
    });

    if (error) {
      throw new Error(error.message || 'Lead submission failed.');
    }

    if (data?.success === false) {
      throw new Error(data.message || 'Lead submission failed.');
    }

    return data;
  }

  const { data, error } = await supabase
    .from('leads')
    .insert([leadPayload]);

  if (error) {
    throw new Error(error.message || 'Lead submission failed.');
  }

  return { success: true, leadId: data?.[0]?.id };
};

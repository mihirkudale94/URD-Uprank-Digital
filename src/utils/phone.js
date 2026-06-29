export const normalizePhoneForVoice = (value, defaultCountryCode = '91') => {
  const cleaned = String(value || '').trim().replace(/[^\d+]/g, '');
  const countryCode = String(defaultCountryCode || '91').replace(/\D/g, '') || '91';
  const withPlus = cleaned.startsWith('00')
    ? `+${cleaned.slice(2)}`
    : cleaned.startsWith('+')
      ? cleaned
      : `+${countryCode}${cleaned.replace(/^0+/, '')}`;

  return /^\+[1-9]\d{7,14}$/.test(withPlus) ? withPlus : '';
};

export const phoneMask = {
  mask: [
    '(',
    /\d/,
    /\d/,
    ')',
    ' ',
    /\d/,
    ' ',
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    '-',
    /\d/,
    /\d/,
    /\d/,
    /\d/,
  ],
};

export const phoneRegex = /^\(\d{2}\) 9 \d{4}-\d{4}$/

export function formatPhone(phone: string) {
  if (!phoneRegex.test(phone)) {
    return null;
  }

  const formattedPhone = phone.replace(
    /^(\d{2})(\d{1})(\d{4})(\d{4})$/,
    '($1) $2 $3-$4'
  );

  return formattedPhone
}
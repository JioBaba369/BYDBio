

'use server';

import type { User } from './users';

/**
 * Escapes special characters in a string for use in a VCF (vCard) file.
 * @param str The string to escape.
 * @returns The escaped string.
 */
export const escapeVCardField = (str: string | undefined | null): string => {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
};


/**
 * Creates a vCard string from a user object.
 * @param user The user object containing profile information.
 * @returns A formatted vCard string.
 */
export const generateVCard = (user: User): string => {
    const { name, username, businessCard, avatarUrl } = user;
    const {
        title = '',
        company = '',
        phone = '',
        email = '',
        website = '',
        linkedin = '',
        location = ''
    } = businessCard || {};

    let vCard = 'BEGIN:VCARD\n';
    vCard += 'VERSION:3.0\n';
    vCard += `FN:${escapeVCardField(name)}\n`;
    if (company) vCard += `ORG:${escapeVCardField(company)}\n`;
    if (title) vCard += `TITLE:${escapeVCardField(title)}\n`;
    if (phone) vCard += `TEL;TYPE=WORK,VOICE:${escapeVCardField(phone)}\n`;
    if (email) vCard += `EMAIL:${escapeVCardField(email)}\n`;
    if (website) vCard += `URL:${escapeVCardField(website)}\n`;
    if (linkedin) vCard += `X-SOCIALPROFILE;type=linkedin:${escapeVCardField(linkedin)}\n`;
    if (location) vCard += `ADR;TYPE=WORK:;;${escapeVCardField(location)}\n`;
    
    // Note: Embedding photos in vCards can be complex and is not universally supported.
    // A link to the profile is a more reliable approach.
    vCard += `URL;type=pref:${process.env.NEXT_PUBLIC_BASE_URL || 'https://byd.bio'}/u/${username}\n`;
    vCard += 'END:VCARD\n';

    return vCard;
}

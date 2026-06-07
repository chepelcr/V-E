import contactData from "../content/contact.json";

/**
 * Company / contact info (phones, email, countryCode, social) + the contact
 * page intro copy. Shared entity referenced by Home, Footer and Financiamiento
 * (so the phones/email never drift between pages).
 */
export type CompanyContact = typeof contactData;

export function getCompany(): CompanyContact {
  return contactData;
}

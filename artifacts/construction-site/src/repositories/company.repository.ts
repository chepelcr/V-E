import contactData from "../content/contact.json";

/**
 * Company / contact info (phones, email, countryCode, social). Shared entity
 * referenced by Home, Footer and Financiamiento (so the phones/email never
 * drift between pages). The contact page intro copy lives in
 * `contactContent.json`, not here.
 */
export type CompanyContact = typeof contactData;

export function getCompany(): CompanyContact {
  return contactData;
}

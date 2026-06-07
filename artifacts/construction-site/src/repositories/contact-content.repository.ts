import contactContentData from "../content/contactContent.json";

/**
 * Contact PAGE content (intro title/subtitle only). Singleton — Pattern 1.
 *
 * Distinct from the shared `contact.json` company/contact-info entity (phones,
 * email, social) edited by `ContactInfoPage`. This file holds only the editorial
 * copy shown at the top of the public contact page; the form labels, validation,
 * toasts and option labels all live in the shared chrome translations.
 */
export type ContactContent = typeof contactContentData;

export function getContactContent(): ContactContent {
  return contactContentData;
}

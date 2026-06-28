import { defineProperty } from "../../schema/property.js";

export const relationshipStatusOptions = [
  { value: "new", label: "New" },
  { value: "met", label: "Met" },
  { value: "active", label: "Active" },
  { value: "collaborating", label: "Collaborating" },
  { value: "dormant", label: "Dormant" },
] as const;

export const contactSourceOptions = [
  { value: "game_jam", label: "Game Jam" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "gdc", label: "GDC" },
  { value: "conference", label: "Conference" },
  { value: "referral", label: "Referral" },
  { value: "cold_outreach", label: "Cold Outreach" },
  { value: "portfolio", label: "Portfolio" },
  { value: "discord", label: "Discord" },
  { value: "twitter", label: "Twitter" },
] as const;

export const interestedInOptions = [
  { value: "freelance_audio", label: "Freelance Audio" },
  { value: "full_time", label: "Full-time" },
  { value: "collaboration", label: "Collaboration" },
  { value: "networking", label: "Networking" },
  { value: "production_music", label: "Production Music" },
] as const;

export const nameProperty = defineProperty({
  key: "name",
  name: "Name",
  type: "title",
  description: "Primary contact name used as the CRM record identifier.",
  required: true,
});

export const companyProperty = defineProperty({
  key: "company",
  name: "Company",
  type: "text",
  description: "Company, studio, or organization associated with the contact.",
});

export const roleProperty = defineProperty({
  key: "role",
  name: "Role",
  type: "text",
  description: "Professional role or title of the contact.",
});

export const countryProperty = defineProperty({
  key: "country",
  name: "Country",
  type: "text",
  description: "Primary country or region for timezone and networking context.",
});

export const emailProperty = defineProperty({
  key: "email",
  name: "Email",
  type: "email",
  description: "Primary email address for direct outreach.",
});

export const websiteProperty = defineProperty({
  key: "website",
  name: "Website",
  type: "url",
  description: "Official website or portfolio link.",
});

export const linkedInProperty = defineProperty({
  key: "linkedIn",
  name: "LinkedIn",
  type: "url",
  description: "LinkedIn profile URL.",
});

export const discordProperty = defineProperty({
  key: "discord",
  name: "Discord",
  type: "text",
  description: "Discord username or contact handle.",
});

export const xTwitterProperty = defineProperty({
  key: "xTwitter",
  name: "X / Twitter",
  type: "url",
  description: "X (Twitter) profile URL.",
});

export const relationshipStatusProperty = defineProperty({
  key: "relationshipStatus",
  name: "Relationship Status",
  type: "select",
  description: "Current stage of the long-term professional relationship.",
  required: true,
  options: relationshipStatusOptions,
});

export const firstContactProperty = defineProperty({
  key: "firstContact",
  name: "First Contact",
  type: "date",
  description: "Date of the first known interaction.",
});

export const lastContactProperty = defineProperty({
  key: "lastContact",
  name: "Last Contact",
  type: "date",
  description: "Most recent interaction date.",
});

export const nextFollowUpProperty = defineProperty({
  key: "nextFollowUp",
  name: "Next Follow-up",
  type: "date",
  description: "Next planned follow-up date.",
});

export const contactSourceProperty = defineProperty({
  key: "contactSource",
  name: "Contact Source",
  type: "select",
  description: "Where the connection originated.",
  options: contactSourceOptions,
});

export const interestedInProperty = defineProperty({
  key: "interestedIn",
  name: "Interested In",
  type: "multi_select",
  description: "Primary collaboration interests or hiring intent.",
  options: interestedInOptions,
});

export const notesProperty = defineProperty({
  key: "notes",
  name: "Notes",
  type: "text",
  description: "Context, conversation history, and relationship notes.",
  multiline: true,
});

export const crmProperties = [
  nameProperty,
  companyProperty,
  roleProperty,
  countryProperty,
  emailProperty,
  websiteProperty,
  linkedInProperty,
  discordProperty,
  xTwitterProperty,
  relationshipStatusProperty,
  firstContactProperty,
  lastContactProperty,
  nextFollowUpProperty,
  contactSourceProperty,
  interestedInProperty,
  notesProperty,
] as const;

export type CRMProperty = (typeof crmProperties)[number];
export type CRMPropertyKey = CRMProperty["key"];

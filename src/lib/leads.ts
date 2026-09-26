export type Personality =
  | "cooperative"
  | "dnc"
  | "hard_of_hearing"
  | "skeptical"
  | "callback"
  | "machine"
  | "impatient"
  | "no_wine"
  | "wrong_number"
  | "hostile"
  | "talkative"
  | "partial"
  | "slow";

export type KitchenPref = "classic" | "upscale";
export type FoodPref = "meat" | "fish" | "veg";
export type WinePref = "red" | "white" | "rose" | "none";
export type BodyPref = "light" | "heavy" | null;

export type LeadAnswers = {
  kitchen: KitchenPref;
  food: FoodPref;
  wine: WinePref;
  frequency: boolean;
  body: BodyPref;
};

export type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  phoneDisplay: string;
  street: string;
  zip: string;
  city: string;
  state: string;
  gender: "female" | "male";
  voiceId: string;
  personality: Personality;
  answers: LeadAnswers;
  crmNote: string;
};

export const LEADS: Lead[] = [
  {
    id: "ingrid-bauer",
    firstName: "Ingrid",
    lastName: "Bauer",
    phone: "+498944129033",
    phoneDisplay: "+49 89 4412 9033",
    street: "Schleißheimer Straße 84",
    zip: "80797",
    city: "München",
    state: "Bayern",
    gender: "female",
    voiceId: "carina",
    personality: "cooperative",
    answers: { kitchen: "classic", food: "meat", wine: "red", frequency: true, body: "heavy" },
    crmNote: "Homeowner · listed as decision maker",
  },
  {
    id: "klaus-weinhold",
    firstName: "Klaus",
    lastName: "Weinhold",
    phone: "+497116502281",
    phoneDisplay: "+49 711 650 2281",
    street: "Königstraße 19",
    zip: "70173",
    city: "Stuttgart",
    state: "Baden-Württemberg",
    gender: "male",
    voiceId: "leo",
    personality: "dnc",
    answers: { kitchen: "classic", food: "meat", wine: "red", frequency: true, body: "heavy" },
    crmNote: "Previous outbound · evening window",
  },
  {
    id: "helga-kruger",
    firstName: "Helga",
    lastName: "Krüger",
    phone: "+494031785520",
    phoneDisplay: "+49 40 3178 5520",
    street: "Eppendorfer Landstraße 42",
    zip: "20249",
    city: "Hamburg",
    state: "Hamburg",
    gender: "female",
    voiceId: "luna",
    personality: "hard_of_hearing",
    answers: { kitchen: "classic", food: "fish", wine: "white", frequency: true, body: "light" },
    crmNote: "Landline only · older household",
  },
  {
    id: "thomas-richter",
    firstName: "Thomas",
    lastName: "Richter",
    phone: "+4922197314408",
    phoneDisplay: "+49 221 9731 4408",
    street: "Venloer Straße 231",
    zip: "50823",
    city: "Köln",
    state: "Nordrhein-Westfalen",
    gender: "male",
    voiceId: "rex",
    personality: "skeptical",
    answers: { kitchen: "upscale", food: "meat", wine: "red", frequency: true, body: "heavy" },
    crmNote: "High-value kitchen score from data file",
  },
  {
    id: "sabine-hoffmann",
    firstName: "Sabine",
    lastName: "Hoffmann",
    phone: "+493088761204",
    phoneDisplay: "+49 30 8876 1204",
    street: "Prenzlauer Allee 156",
    zip: "10409",
    city: "Berlin",
    state: "Berlin",
    gender: "female",
    voiceId: "iris",
    personality: "callback",
    answers: { kitchen: "upscale", food: "veg", wine: "rose", frequency: false, body: "light" },
    crmNote: "Weekday mornings often busy",
  },
  {
    id: "werner-schulz",
    firstName: "Werner",
    lastName: "Schulz",
    phone: "+496924007712",
    phoneDisplay: "+49 69 2400 7712",
    street: "Berger Straße 178",
    zip: "60385",
    city: "Frankfurt am Main",
    state: "Hessen",
    gender: "male",
    voiceId: "lux",
    personality: "machine",
    answers: { kitchen: "classic", food: "meat", wine: "red", frequency: true, body: "heavy" },
    crmNote: "Two previous no-answers",
  },
  {
    id: "petra-neumann",
    firstName: "Petra",
    lastName: "Neumann",
    phone: "+4921154003381",
    phoneDisplay: "+49 211 5400 3381",
    street: "Königsallee 27",
    zip: "40212",
    city: "Düsseldorf",
    state: "Nordrhein-Westfalen",
    gender: "female",
    voiceId: "celeste",
    personality: "cooperative",
    answers: { kitchen: "upscale", food: "fish", wine: "white", frequency: true, body: "light" },
    crmNote: "Apartment with recent remodel flag",
  },
  {
    id: "hans-peter-vogt",
    firstName: "Hans-Peter",
    lastName: "Vogt",
    phone: "+4934122550190",
    phoneDisplay: "+49 341 2255 0190",
    street: "Karl-Liebknecht-Straße 12",
    zip: "04107",
    city: "Leipzig",
    state: "Sachsen",
    gender: "male",
    voiceId: "perseus",
    personality: "impatient",
    answers: { kitchen: "classic", food: "meat", wine: "red", frequency: true, body: "heavy" },
    crmNote: "Short call window · after 17:00 preferred",
  },
  {
    id: "monika-schafer",
    firstName: "Monika",
    lastName: "Schäfer",
    phone: "+499113768841",
    phoneDisplay: "+49 911 376 8841",
    street: "Königstraße 64",
    zip: "90402",
    city: "Nürnberg",
    state: "Bayern",
    gender: "female",
    voiceId: "ara",
    personality: "no_wine",
    answers: { kitchen: "classic", food: "veg", wine: "none", frequency: false, body: null },
    crmNote: "Health-conscious household tag",
  },
  {
    id: "jurgen-brandt",
    firstName: "Jürgen",
    lastName: "Brandt",
    phone: "+4942116889034",
    phoneDisplay: "+49 421 1688 9034",
    street: "Ostertorsteinweg 88",
    zip: "28203",
    city: "Bremen",
    state: "Bremen",
    gender: "male",
    voiceId: "atlas",
    personality: "wrong_number",
    answers: { kitchen: "classic", food: "meat", wine: "red", frequency: true, body: "heavy" },
    crmNote: "Number sourced from 2023 file",
  },
  {
    id: "anneliese-wolf",
    firstName: "Anneliese",
    lastName: "Wolf",
    phone: "+4935140407721",
    phoneDisplay: "+49 351 4040 7721",
    street: "Hauptstraße 9",
    zip: "01097",
    city: "Dresden",
    state: "Sachsen",
    gender: "female",
    voiceId: "aurora",
    personality: "slow",
    answers: { kitchen: "classic", food: "meat", wine: "white", frequency: true, body: "light" },
    crmNote: "Senior household · speak clearly",
  },
  {
    id: "michael-konig",
    firstName: "Michael",
    lastName: "König",
    phone: "+495113362290",
    phoneDisplay: "+49 511 336 2290",
    street: "Lister Meile 45",
    zip: "30161",
    city: "Hannover",
    state: "Niedersachsen",
    gender: "male",
    voiceId: "orion",
    personality: "talkative",
    answers: { kitchen: "upscale", food: "fish", wine: "red", frequency: true, body: "heavy" },
    crmNote: "Engaged on previous mailer",
  },
  {
    id: "claudia-berg",
    firstName: "Claudia",
    lastName: "Berg",
    phone: "+4920117448803",
    phoneDisplay: "+49 201 1744 8803",
    street: "Rüttenscheider Straße 110",
    zip: "45130",
    city: "Essen",
    state: "Nordrhein-Westfalen",
    gender: "female",
    voiceId: "eve",
    personality: "partial",
    answers: { kitchen: "upscale", food: "veg", wine: "rose", frequency: true, body: "light" },
    crmNote: "GDPR-sensitive region · confirm spelling",
  },
  {
    id: "dieter-hartmann",
    firstName: "Dieter",
    lastName: "Hartmann",
    phone: "+4962115004472",
    phoneDisplay: "+49 621 1500 4472",
    street: "Planken 18",
    zip: "68161",
    city: "Mannheim",
    state: "Baden-Württemberg",
    gender: "male",
    voiceId: "sal",
    personality: "hostile",
    answers: { kitchen: "classic", food: "meat", wine: "red", frequency: true, body: "heavy" },
    crmNote: "Do not offer extras · keep short",
  },
  {
    id: "elisabeth-mohr",
    firstName: "Elisabeth",
    lastName: "Mohr",
    phone: "+497612906618",
    phoneDisplay: "+49 761 290 6618",
    street: "Kaiser-Joseph-Straße 254",
    zip: "79098",
    city: "Freiburg im Breisgau",
    state: "Baden-Württemberg",
    gender: "female",
    voiceId: "liora",
    personality: "cooperative",
    answers: { kitchen: "upscale", food: "veg", wine: "rose", frequency: true, body: "light" },
    crmNote: "Wine club lookalike · high fit",
  },
];

export function leadById(id: string): Lead | undefined {
  return LEADS.find((lead) => lead.id === id);
}

export function initials(lead: Lead): string {
  return `${lead.firstName.charAt(0)}${lead.lastName.charAt(0)}`.toUpperCase();
}

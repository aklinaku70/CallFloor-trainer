export type AgentStepId =
  | "greeting"
  | "intro"
  | "q1"
  | "q2"
  | "q3"
  | "q3b"
  | "q4"
  | "lastname"
  | "firstname"
  | "gift"
  | "thanks";

export type ScriptStep = {
  id: AgentStepId;
  order: number;
  title: string;
  say: string;
  hint: string;
  keywords: string[];
  minHits: number;
};

export const SCRIPT_STEPS: ScriptStep[] = [
  {
    id: "greeting",
    order: 1,
    title: "Greeting · sorry for the time",
    say: "Guten Tag, Entschuldigung für die Störung. Haben Sie einen kurzen Moment?",
    hint: "Cold call open — greet, apologise, ask for a moment.",
    keywords: ["guten tag", "hallo", "entschuldigung", "storung", "moment", "zeit"],
    minHits: 2,
  },
  {
    id: "intro",
    order: 2,
    title: "Four questions · 20 seconds",
    say: "Ich habe vier Fragen für Sie, es dauert zwanzig Sekunden.",
    hint: "Promise it is short so they stay on the line.",
    keywords: ["vier fragen", "4 fragen", "fragen", "zwanzig", "20 sekunden", "sekunden"],
    minHits: 2,
  },
  {
    id: "q1",
    order: 3,
    title: "Q1 · Kitchen",
    say: "Bevorzugen Sie A) klassische Küche oder B) gehobene Küche?",
    hint: "Classic vs upscale kitchen.",
    keywords: ["bevorzugen", "klassische", "gehobene", "kuche", "kueche"],
    minHits: 2,
  },
  {
    id: "q2",
    order: 4,
    title: "Q2 · Food",
    say: "Essen Sie lieber A) Fleisch, B) Fisch oder C) vegetarisch?",
    hint: "Meat, fish, or vegetarian.",
    keywords: ["essen", "lieber", "fleisch", "fisch", "vegetarisch"],
    minHits: 2,
  },
  {
    id: "q3",
    order: 5,
    title: "Q3 · Wine colour",
    say: "Was trinken Sie lieber? A) Rot, B) Weiß oder C) Rosé?",
    hint: "Red, white, or rosé.",
    keywords: ["trinken", "lieber", "rot", "weiss", "weiß", "rose", "wein"],
    minHits: 2,
  },
  {
    id: "q3b",
    order: 6,
    title: "Q3b · Frequency",
    say: "Trinken Sie zwei- bis dreimal pro Jahr Rot-, Weiß- oder Roséwein?",
    hint: "Do they drink wine 2–3 times a year?",
    keywords: ["trinken", "zwei", "drei", "jahr", "wein", "mal"],
    minHits: 2,
  },
  {
    id: "q4",
    order: 7,
    title: "Q4 · Wine body",
    say: "Bevorzugen Sie A) leichte Weine oder B) schwere Weine?",
    hint: "Light vs heavy wines.",
    keywords: ["bevorzugen", "leichte", "schwere", "weine"],
    minHits: 2,
  },
  {
    id: "lastname",
    order: 8,
    title: "Last name · spell it",
    say: "Entschuldigung, wie ist Ihr Nachname? Können Sie bitte buchstabieren?",
    hint: "Ask for the last name and have them spell it.",
    keywords: ["nachname", "name", "buchstabieren"],
    minHits: 1,
  },
  {
    id: "firstname",
    order: 9,
    title: "First name · spell it",
    say: "Und Ihr Vorname bitte? Bitte buchstabieren Sie.",
    hint: "First name, then spell it.",
    keywords: ["vorname", "buchstabieren"],
    minHits: 1,
  },
  {
    id: "gift",
    order: 10,
    title: "Thank-you call",
    say: "Als Dankeschön bekommen Sie noch einen Anruf von uns!",
    hint: "Promise a follow-up call as a thank-you.",
    keywords: ["dankeschon", "dankeschön", "anruf", "bekommen"],
    minHits: 2,
  },
  {
    id: "thanks",
    order: 11,
    title: "Close the call",
    say: "Dankeschön für Ihre Zeit. Auf Wiederhören.",
    hint: "Thank them for their time and hang up.",
    keywords: ["dankeschon", "dankeschön", "zeit", "wiederhoren", "wiederhören"],
    minHits: 1,
  },
];

export const STEP_BY_ID: Record<AgentStepId, ScriptStep> = Object.fromEntries(
  SCRIPT_STEPS.map((step) => [step.id, step]),
) as Record<AgentStepId, ScriptStep>;

export const STEP_ORDER: AgentStepId[] = SCRIPT_STEPS.map((s) => s.id);

export function nextStepAfter(
  id: AgentStepId,
  skip: Partial<Record<AgentStepId, boolean>> = {},
): AgentStepId | null {
  const index = STEP_ORDER.indexOf(id);
  for (let i = index + 1; i < STEP_ORDER.length; i++) {
    const candidate = STEP_ORDER[i];
    if (!skip[candidate]) return candidate;
  }
  return null;
}

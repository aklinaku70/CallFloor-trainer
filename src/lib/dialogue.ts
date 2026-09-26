import type { Lead, LeadAnswers } from "./leads";
import type { AgentStepId } from "./script";

export type Disposition =
  | "completed"
  | "dnc"
  | "callback"
  | "answering_machine"
  | "hangup"
  | "wrong_number"
  | "no_answer"
  | "refused"
  | "agent_hangup";

export type CapturedAnswers = {
  kitchen: LeadAnswers["kitchen"] | null;
  food: LeadAnswers["food"] | null;
  wine: LeadAnswers["wine"] | null;
  frequency: boolean | null;
  body: LeadAnswers["body"];
  lastName: string;
  firstName: string;
};

export type CustomerTurn = {
  text: string;
  endWith?: Disposition;
  answers?: Partial<CapturedAnswers>;
  nextStep?: AgentStepId | "end";
  expectRepeat?: boolean;
  skip?: AgentStepId[];
};

const GERMAN_SPELL: Record<string, string> = {
  a: "Anton",
  b: "Berta",
  c: "Cäsar",
  d: "Dora",
  e: "Emil",
  f: "Friedrich",
  g: "Gustav",
  h: "Heinrich",
  i: "Ida",
  j: "Julius",
  k: "Kaufmann",
  l: "Ludwig",
  m: "Martha",
  n: "Nordpol",
  o: "Otto",
  p: "Paula",
  q: "Quelle",
  r: "Richard",
  s: "Samuel",
  t: "Theodor",
  u: "Ulrich",
  v: "Viktor",
  w: "Wilhelm",
  x: "Xanthippe",
  y: "Ypsilon",
  z: "Zacharias",
  ä: "Ärger",
  ö: "Ökonom",
  ü: "Übermut",
  ß: "Eszett",
  "-": "Bindestrich",
  " ": "Leerzeichen",
};

export function spellName(name: string): string {
  const parts: string[] = [];
  for (const char of name) {
    const key = char.toLowerCase();
    const word = GERMAN_SPELL[key];
    if (word) parts.push(word);
    else if (char.trim()) parts.push(char.toUpperCase());
  }
  return parts.join(", ");
}

function kitchenLine(lead: Lead): string {
  return lead.answers.kitchen === "classic" ? "klassische Küche" : "gehobene Küche";
}

function foodLine(lead: Lead): string {
  if (lead.answers.food === "meat") return "Fleisch";
  if (lead.answers.food === "fish") return "Fisch";
  return "vegetarisch";
}

function wineLine(lead: Lead): string {
  if (lead.answers.wine === "red") return "Rotwein";
  if (lead.answers.wine === "white") return "Weißwein";
  if (lead.answers.wine === "rose") return "Rosé";
  return "keinen Wein";
}

function bodyLine(lead: Lead): string {
  return lead.answers.body === "heavy" ? "schwere Weine" : "leichte Weine";
}

export function pickupLine(lead: Lead): CustomerTurn {
  if (lead.personality === "machine") {
    return {
      text: `Guten Tag, Sie haben die Mailbox von ${lead.firstName} ${lead.lastName} erreicht. Bitte hinterlassen Sie nach dem Ton eine Nachricht.`,
      endWith: "answering_machine",
      nextStep: "end",
    };
  }
  if (lead.personality === "hostile") {
    return { text: "Ja?", nextStep: "greeting" };
  }
  if (lead.personality === "slow") {
    return { text: "Hallo? Ja, bitte?", nextStep: "greeting" };
  }
  return { text: "Hallo?", nextStep: "greeting" };
}

export function replyToStep(
  lead: Lead,
  step: AgentStepId,
  repeats: number,
): CustomerTurn {
  const { personality, answers } = lead;

  if (personality === "hostile") {
    return {
      text: "Nee, kein Interesse. Legen Sie auf, und rufen Sie nie wieder an!",
      endWith: "hangup",
      nextStep: "end",
    };
  }

  if (personality === "wrong_number") {
    return {
      text: `Moment mal, wer? Hier wohnt kein ${lead.firstName} ${lead.lastName}. Sie haben die falsche Nummer.`,
      endWith: "wrong_number",
      nextStep: "end",
    };
  }

  if (personality === "dnc" && (step === "greeting" || step === "intro")) {
    return {
      text: "Bitte rufen Sie hier nicht mehr an. Streichen Sie uns von der Liste, ja? Auf Wiederhören.",
      endWith: "dnc",
      nextStep: "end",
    };
  }

  if (personality === "hard_of_hearing" && repeats < 1 && step !== "thanks" && step !== "gift") {
    return {
      text: "Wie bitte? Ich verstehe Sie nicht gut. Können Sie das noch einmal sagen, etwas langsamer?",
      expectRepeat: true,
    };
  }

  if (personality === "skeptical" && step === "greeting") {
    return {
      text: "Wer ist das denn? Von welcher Firma rufen Sie an, und wozu die Fragen?",
      nextStep: "intro",
    };
  }

  if (personality === "callback" && (step === "greeting" || step === "intro")) {
    return {
      text: "Ach, jetzt ist wirklich schlecht. Rufen Sie bitte später noch einmal an, ja?",
      endWith: "callback",
      nextStep: "end",
    };
  }

  switch (step) {
    case "greeting": {
      if (personality === "talkative") {
        return {
          text: "Ja, hallo, guten Tag. Ich koche gerade, aber wenn es wirklich nur kurz ist, können wir sprechen.",
          nextStep: "intro",
        };
      }
      if (personality === "slow") {
        return {
          text: "Ja... guten Tag. Einen Moment... ja, ich höre.",
          nextStep: "intro",
        };
      }
      if (personality === "impatient") {
        return {
          text: "Ja, aber machen Sie schnell, ich habe nicht viel Zeit.",
          nextStep: "intro",
        };
      }
      return {
        text: "Ja, guten Tag. Bitte, aber machen Sie es kurz.",
        nextStep: "intro",
      };
    }
    case "intro": {
      if (personality === "skeptical") {
        return {
          text: "Na gut. Vier Fragen, zwanzig Sekunden. Dann aber wirklich nur das.",
          nextStep: "q1",
        };
      }
      return {
        text: "In Ordnung, ja. Fragen Sie.",
        nextStep: "q1",
      };
    }
    case "q1": {
      const fill: Partial<CapturedAnswers> = { kitchen: answers.kitchen };
      if (personality === "impatient") {
        return {
          text: `Ja, ${kitchenLine(lead)}. Gut, das reicht mir jetzt, ich muss Schluss machen.`,
          answers: fill,
          endWith: "refused",
          nextStep: "end",
        };
      }
      if (personality === "talkative") {
        return {
          text: `Also, wir haben eher eine ${kitchenLine(lead)}, nichts zu Teures, wir sind nicht so die Leute für Showküchen. ${kitchenLine(lead)}, ja.`,
          answers: fill,
          nextStep: "q2",
        };
      }
      if (personality === "slow") {
        return {
          text: `Ja... also... ${kitchenLine(lead)} würde ich sagen... ja.`,
          answers: fill,
          nextStep: "q2",
        };
      }
      return {
        text: `A, ${kitchenLine(lead)}.`,
        answers: fill,
        nextStep: "q2",
      };
    }
    case "q2": {
      const fill: Partial<CapturedAnswers> = { food: answers.food };
      if (personality === "talkative") {
        return {
          text: `Essen... ${foodLine(lead)}, ganz klar. Am Wochenende kochen wir gerne, da darf es etwas Gutes sein.`,
          answers: fill,
          nextStep: "q3",
        };
      }
      return {
        text: `${foodLine(lead)}.`,
        answers: fill,
        nextStep: "q3",
      };
    }
    case "q3": {
      if (personality === "no_wine" || answers.wine === "none") {
        return {
          text: "Wein trinke ich gar nicht. Weder rot noch weiß, das lasse ich.",
          answers: { wine: "none", frequency: false, body: null },
          nextStep: "lastname",
          skip: ["q3b", "q4"],
        };
      }
      const fill: Partial<CapturedAnswers> = { wine: answers.wine };
      if (personality === "talkative") {
        return {
          text: `Zum Essen trinke ich am liebsten ${wineLine(lead)}. Nicht jeden Tag, aber wenn, dann das.`,
          answers: fill,
          nextStep: "q3b",
        };
      }
      return {
        text: `${wineLine(lead)}.`,
        answers: fill,
        nextStep: "q3b",
      };
    }
    case "q3b": {
      const yes = answers.frequency;
      return {
        text: yes
          ? "Ja, zwei- bis dreimal im Jahr, ungefähr. Manchmal auch öfter."
          : "Eher selten. Nicht wirklich zwei- oder dreimal im Jahr.",
        answers: { frequency: yes },
        nextStep: "q4",
      };
    }
    case "q4": {
      if (!answers.body) {
        return {
          text: "Da habe ich keine Präferenz, tut mir leid.",
          answers: { body: null },
          nextStep: "lastname",
        };
      }
      return {
        text: `${bodyLine(lead)}, würde ich sagen.`,
        answers: { body: answers.body },
        nextStep: "lastname",
      };
    }
    case "lastname": {
      if (personality === "partial") {
        return {
          text: `Den Nachnamen buchstabiere ich nicht am Telefon. ${lead.lastName}, das reicht.`,
          answers: { lastName: lead.lastName },
          nextStep: "firstname",
        };
      }
      return {
        text: `Mein Nachname ist ${lead.lastName}. ${spellName(lead.lastName)}. ${lead.lastName}.`,
        answers: { lastName: lead.lastName },
        nextStep: "firstname",
      };
    }
    case "firstname": {
      if (personality === "partial") {
        return {
          text: `${lead.firstName}. Mehr nicht.`,
          answers: { firstName: lead.firstName },
          nextStep: "gift",
        };
      }
      return {
        text: `Vorname ${lead.firstName}. ${spellName(lead.firstName)}.`,
        answers: { firstName: lead.firstName },
        nextStep: "gift",
      };
    }
    case "gift": {
      return {
        text: "Ach, das ist nett. Gut, dann warte ich darauf.",
        nextStep: "thanks",
      };
    }
    case "thanks": {
      return {
        text: "Bitte, auf Wiederhören.",
        endWith: "completed",
        nextStep: "end",
      };
    }
    default:
      return { text: "Ja?", nextStep: "end" };
  }
}

export const DISPOSITION_LABEL: Record<Disposition, string> = {
  completed: "Completed survey",
  dnc: "Do not call",
  callback: "Call back later",
  answering_machine: "Answering machine",
  hangup: "Customer hang-up",
  wrong_number: "Wrong number",
  no_answer: "No answer",
  refused: "Refused mid-survey",
  agent_hangup: "Agent ended call",
};

export const DISPOSITION_SHORT: Record<Disposition, string> = {
  completed: "Done",
  dnc: "DNC",
  callback: "Later",
  answering_machine: "Machine",
  hangup: "Hang-up",
  wrong_number: "Wrong #",
  no_answer: "No answer",
  refused: "Refused",
  agent_hangup: "Ended",
};

export function emptyCapture(): CapturedAnswers {
  return {
    kitchen: null,
    food: null,
    wine: null,
    frequency: null,
    body: null,
    lastName: "",
    firstName: "",
  };
}

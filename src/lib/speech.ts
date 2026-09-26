import { normalizeDe } from "./utils";
import { STEP_BY_ID, type AgentStepId } from "./script";

type RecognitionCtor = new () => SpeechRecognitionLike;

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecEvent = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

export function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function stepMatches(heard: string, stepId: AgentStepId): boolean {
  const step = STEP_BY_ID[stepId];
  const hay = normalizeDe(heard);
  if (!hay) return false;
  let hits = 0;
  for (const keyword of step.keywords) {
    if (hay.includes(normalizeDe(keyword))) hits += 1;
  }
  return hits >= step.minHits;
}

export class AgentListener {
  private rec: SpeechRecognitionLike | null = null;
  private wanted = false;
  private buffer = "";

  constructor(private onTranscript: (text: string, isFinal: boolean) => void) {}

  get supported() {
    return getRecognitionCtor() != null;
  }

  start() {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return false;
    this.stop();
    this.wanted = true;
    this.buffer = "";
    const rec = new Ctor();
    rec.lang = "de-DE";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.onresult = (event) => {
      let interim = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) finalText += piece;
        else interim += piece;
      }
      if (finalText) {
        this.buffer = `${this.buffer} ${finalText}`.trim();
        this.onTranscript(this.buffer, true);
      } else {
        this.onTranscript(`${this.buffer} ${interim}`.trim(), false);
      }
    };
    rec.onerror = () => {
      /* keep going unless aborted */
    };
    rec.onend = () => {
      if (this.wanted) {
        try {
          rec.start();
        } catch {
          /* already started */
        }
      }
    };
    this.rec = rec;
    try {
      rec.start();
      return true;
    } catch {
      return false;
    }
  }

  stop() {
    this.wanted = false;
    if (this.rec) {
      try {
        this.rec.onend = null;
        this.rec.stop();
      } catch {
        /* ignore */
      }
      this.rec = null;
    }
  }

  resetBuffer() {
    this.buffer = "";
  }
}

import { create } from "zustand";
import { LEADS, type Lead } from "./leads";
import {
  emptyCapture,
  type CapturedAnswers,
  type Disposition,
} from "./dialogue";
import type { AgentStepId } from "./script";

export type LeadStatus = "open" | "in_call" | "done";

export type CheckState = "pending" | "current" | "done" | "skipped";

export type TranscriptLine = {
  id: string;
  who: "agent" | "customer" | "system";
  text: string;
  at: number;
};

export type CallPhase = "idle" | "dialing" | "ringing" | "connected" | "ended";

export type CallSession = {
  leadId: string;
  phase: CallPhase;
  startedAt: number | null;
  connectedAt: number | null;
  endedAt: number | null;
  currentStep: AgentStepId | null;
  agentTurn: boolean;
  customerSpeaking: boolean;
  repeats: number;
  disposition: Disposition | null;
  checks: Record<AgentStepId, CheckState>;
  capture: CapturedAnswers;
  skip: Partial<Record<AgentStepId, boolean>>;
  heard: string;
};

export type CallRecord = {
  leadId: string;
  at: number;
  durationSec: number;
  disposition: Disposition;
  checksDone: number;
};

export type LeadRuntime = {
  status: LeadStatus;
  disposition: Disposition | null;
};

const STORAGE_KEY = "callfloor-v1";

function freshChecks(): Record<AgentStepId, CheckState> {
  return {
    greeting: "pending",
    intro: "pending",
    q1: "pending",
    q2: "pending",
    q3: "pending",
    q3b: "pending",
    q4: "pending",
    lastname: "pending",
    firstname: "pending",
    gift: "pending",
    thanks: "pending",
  };
}

function defaultRuntimes(): Record<string, LeadRuntime> {
  return Object.fromEntries(LEADS.map((l) => [l.id, { status: "open" as const, disposition: null }]));
}

type CallState = {
  hydrated: boolean;
  agentName: string;
  briefed: boolean;
  selectedId: string | null;
  dialInput: string;
  runtimes: Record<string, LeadRuntime>;
  history: CallRecord[];
  session: CallSession | null;
  transcript: TranscriptLine[];
  micOn: boolean;
  lastError: string | null;
  hydrate: () => void;
  persist: () => void;
  setAgentName: (name: string) => void;
  setBriefed: () => void;
  selectLead: (id: string | null) => void;
  setDialInput: (value: string) => void;
  appendDial: (ch: string) => void;
  backspaceDial: () => void;
  clearDial: () => void;
  setCapture: (patch: Partial<CapturedAnswers>) => void;
  setHeard: (text: string) => void;
  setMicOn: (on: boolean) => void;
  setLastError: (msg: string | null) => void;
  pushTranscript: (who: TranscriptLine["who"], text: string) => void;
  beginSession: (leadId: string) => void;
  setPhase: (phase: CallPhase) => void;
  markConnected: () => void;
  setCustomerSpeaking: (on: boolean) => void;
  setAgentTurn: (on: boolean) => void;
  setCurrentStep: (id: AgentStepId | null) => void;
  markStep: (id: AgentStepId, state: CheckState) => void;
  bumpRepeat: () => void;
  resetRepeats: () => void;
  applySkip: (ids: AgentStepId[]) => void;
  patchCapture: (patch: Partial<CapturedAnswers>) => void;
  endSession: (disposition: Disposition) => void;
  resetCampaign: () => void;
};

function persistNow(state: Pick<CallState, "agentName" | "briefed" | "runtimes" | "history">) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        agentName: state.agentName,
        briefed: state.briefed,
        runtimes: state.runtimes,
        history: state.history.slice(-80),
      }),
    );
  } catch {
    /* ignore quota */
  }
}

export const useCallStore = create<CallState>((set, get) => ({
  hydrated: false,
  agentName: "",
  briefed: false,
  selectedId: null,
  dialInput: "",
  runtimes: defaultRuntimes(),
  history: [],
  session: null,
  transcript: [],
  micOn: false,
  lastError: null,

  hydrate: () => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        set({ hydrated: true });
        return;
      }
      const parsed = JSON.parse(raw) as Partial<CallState>;
      set({
        hydrated: true,
        agentName: typeof parsed.agentName === "string" ? parsed.agentName : "",
        briefed: Boolean(parsed.briefed),
        runtimes: parsed.runtimes ?? defaultRuntimes(),
        history: Array.isArray(parsed.history) ? parsed.history : [],
      });
    } catch {
      set({ hydrated: true });
    }
  },

  persist: () => {
    const s = get();
    persistNow(s);
  },

  setAgentName: (name) => {
    set({ agentName: name });
    persistNow(get());
  },

  setBriefed: () => {
    set({ briefed: true });
    persistNow(get());
  },

  selectLead: (id) =>
    set((s) => ({
      selectedId: id,
      lastError: null,
      session: s.session?.phase === "ended" ? null : s.session,
      transcript: s.session?.phase === "ended" ? [] : s.transcript,
    })),

  setDialInput: (value) => set({ dialInput: value }),

  appendDial: (ch) =>
    set((s) => ({
      dialInput: `${s.dialInput}${ch}`.slice(0, 22),
    })),

  backspaceDial: () => set((s) => ({ dialInput: s.dialInput.slice(0, -1) })),

  clearDial: () => set({ dialInput: "" }),

  setCapture: (patch) =>
    set((s) =>
      s.session
        ? { session: { ...s.session, capture: { ...s.session.capture, ...patch } } }
        : s,
    ),

  setHeard: (text) =>
    set((s) => (s.session ? { session: { ...s.session, heard: text } } : s)),

  setMicOn: (on) => set({ micOn: on }),

  setLastError: (msg) => set({ lastError: msg }),

  pushTranscript: (who, text) =>
    set((s) => ({
      transcript: [
        ...s.transcript,
        { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, who, text, at: Date.now() },
      ].slice(-80),
    })),

  beginSession: (leadId) =>
    set((s) => ({
      selectedId: leadId,
      transcript: [],
      lastError: null,
      runtimes: {
        ...s.runtimes,
        [leadId]: { status: "in_call", disposition: s.runtimes[leadId]?.disposition ?? null },
      },
      session: {
        leadId,
        phase: "dialing",
        startedAt: Date.now(),
        connectedAt: null,
        endedAt: null,
        currentStep: null,
        agentTurn: false,
        customerSpeaking: false,
        repeats: 0,
        disposition: null,
        checks: freshChecks(),
        capture: emptyCapture(),
        skip: {},
        heard: "",
      },
    })),

  setPhase: (phase) =>
    set((s) => (s.session ? { session: { ...s.session, phase } } : s)),

  markConnected: () =>
    set((s) =>
      s.session
        ? { session: { ...s.session, phase: "connected", connectedAt: Date.now() } }
        : s,
    ),

  setCustomerSpeaking: (on) =>
    set((s) => (s.session ? { session: { ...s.session, customerSpeaking: on } } : s)),

  setAgentTurn: (on) =>
    set((s) => (s.session ? { session: { ...s.session, agentTurn: on } } : s)),

  setCurrentStep: (id) =>
    set((s) => {
      if (!s.session) return s;
      const checks = { ...s.session.checks };
      (Object.keys(checks) as AgentStepId[]).forEach((key) => {
        if (checks[key] === "current") checks[key] = "pending";
      });
      if (id && checks[id] !== "done" && checks[id] !== "skipped") checks[id] = "current";
      return { session: { ...s.session, currentStep: id, checks, heard: "", repeats: 0 } };
    }),

  markStep: (id, state) =>
    set((s) => {
      if (!s.session) return s;
      return {
        session: {
          ...s.session,
          checks: { ...s.session.checks, [id]: state },
        },
      };
    }),

  bumpRepeat: () =>
    set((s) => (s.session ? { session: { ...s.session, repeats: s.session.repeats + 1 } } : s)),

  resetRepeats: () =>
    set((s) => (s.session ? { session: { ...s.session, repeats: 0 } } : s)),

  applySkip: (ids) =>
    set((s) => {
      if (!s.session) return s;
      const checks = { ...s.session.checks };
      const skip = { ...s.session.skip };
      for (const id of ids) {
        skip[id] = true;
        if (checks[id] !== "done") checks[id] = "skipped";
      }
      return { session: { ...s.session, checks, skip } };
    }),

  patchCapture: (patch) =>
    set((s) =>
      s.session
        ? { session: { ...s.session, capture: { ...s.session.capture, ...patch } } }
        : s,
    ),

  endSession: (disposition) => {
    const s = get();
    if (!s.session) return;
    const leadId = s.session.leadId;
    const durationSec = s.session.connectedAt
      ? Math.max(1, Math.round((Date.now() - s.session.connectedAt) / 1000))
      : 0;
    const checksDone = Object.values(s.session.checks).filter((c) => c === "done").length;
    const record: CallRecord = {
      leadId,
      at: Date.now(),
      durationSec,
      disposition,
      checksDone,
    };
    set({
      session: {
        ...s.session,
        phase: "ended",
        endedAt: Date.now(),
        agentTurn: false,
        customerSpeaking: false,
        disposition,
      },
      runtimes: {
        ...s.runtimes,
        [leadId]: { status: "done", disposition },
      },
      history: [...s.history, record].slice(-80),
      micOn: false,
    });
    persistNow(get());
  },

  resetCampaign: () => {
    set({
      runtimes: defaultRuntimes(),
      history: [],
      session: null,
      transcript: [],
      selectedId: null,
      dialInput: "",
      lastError: null,
    });
    persistNow(get());
  },
}));

export function selectedLead(): Lead | undefined {
  const id = useCallStore.getState().selectedId;
  return LEADS.find((l) => l.id === id);
}

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { LEADS, leadById } from "./leads";
import { pickupLine, replyToStep, DISPOSITION_LABEL, type Disposition } from "./dialogue";
import { STEP_BY_ID, type AgentStepId } from "./script";
import { numbersMatch } from "./utils";
import { synthesizeSpeech } from "./tts";
import {
  b64ToBlob,
  playBeep,
  playBlob,
  playBusy,
  playLineClick,
  speakBrowser,
  startRingback,
} from "./phone-audio";
import { AgentListener, stepMatches } from "./speech";
import { useCallStore } from "./store";

const audioCache = new Map<string, Blob>();

async function speakCustomer(text: string, voiceId: string, signal: AbortSignal) {
  const key = `${voiceId}::${text}`;
  const cached = audioCache.get(key);
  if (cached) {
    await playBlob(cached, signal);
    return;
  }
  try {
    const result = await synthesizeSpeech({ data: { text, voiceId } });
    if (result.ok) {
      const blob = b64ToBlob(result.audioBase64, result.mimeType);
      audioCache.set(key, blob);
      await playBlob(blob, signal);
      return;
    }
  } catch {
    /* fall through */
  }
  await speakBrowser(text, "de-DE", signal);
}

export function useCallController() {
  const abortRef = useRef<AbortController | null>(null);
  const ringStopRef = useRef<(() => void) | null>(null);
  const listenerRef = useRef<AgentListener | null>(null);
  const speakingLock = useRef(false);
  const markSaidRef = useRef<(stepId: AgentStepId, spoken?: string) => Promise<void>>(
    async () => {},
  );

  const stopAudio = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    ringStopRef.current?.();
    ringStopRef.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const stopMic = useCallback(() => {
    listenerRef.current?.stop();
    useCallStore.getState().setMicOn(false);
  }, []);

  const startMic = useCallback(() => {
    const store = useCallStore.getState();
    if (!store.session || store.session.phase !== "connected" || !store.session.agentTurn) return;
    if (!listenerRef.current) {
      listenerRef.current = new AgentListener((text, isFinal) => {
        const s = useCallStore.getState();
        if (!s.session || !s.session.agentTurn || s.session.customerSpeaking) return;
        s.setHeard(text);
        if (!isFinal || !s.session.currentStep) return;
        if (stepMatches(text, s.session.currentStep)) {
          void markSaidRef.current(s.session.currentStep, text);
        }
      });
    }
    const ok = listenerRef.current.start();
    useCallStore.getState().setMicOn(Boolean(ok));
  }, []);

  const playTurn = useCallback(
    async (text: string, voiceId: string) => {
      const store = useCallStore.getState();
      if (!store.session) return;
      speakingLock.current = true;
      store.setCustomerSpeaking(true);
      store.setAgentTurn(false);
      store.pushTranscript("customer", text);
      stopMic();
      const signal = abortRef.current?.signal ?? new AbortController().signal;
      try {
        await speakCustomer(text, voiceId, signal);
      } catch {
        /* still continue */
      } finally {
        speakingLock.current = false;
        useCallStore.getState().setCustomerSpeaking(false);
      }
    },
    [stopMic],
  );

  const finishCall = useCallback(
    (disposition: Disposition, systemText?: string) => {
      stopAudio();
      stopMic();
      const store = useCallStore.getState();
      if (systemText) store.pushTranscript("system", systemText);
      store.endSession(disposition);
      toast.message(DISPOSITION_LABEL[disposition]);
    },
    [stopAudio, stopMic],
  );

  const afterCustomer = useCallback(
    async (leadId: string, turn: ReturnType<typeof pickupLine>) => {
      const lead = leadById(leadId);
      if (!lead) return;
      await playTurn(turn.text, lead.voiceId);
      if (turn.endWith === "answering_machine") {
        playBeep();
      }
      const store = useCallStore.getState();
      if (!store.session || store.session.phase === "ended") return;
      if (turn.answers) store.patchCapture(turn.answers);
      if (turn.skip) store.applySkip(turn.skip);
      if (turn.endWith) {
        finishCall(turn.endWith);
        return;
      }
      if (turn.expectRepeat) {
        store.bumpRepeat();
        store.setAgentTurn(true);
        startMic();
        return;
      }
      if (turn.nextStep === "end" || !turn.nextStep) {
        store.setAgentTurn(true);
        startMic();
        return;
      }
      store.setCurrentStep(turn.nextStep);
      store.setAgentTurn(true);
      startMic();
    },
    [finishCall, playTurn, startMic],
  );

  const markSaid = useCallback(
    async (stepId: AgentStepId, spoken?: string) => {
      const store = useCallStore.getState();
      const session = store.session;
      if (!session || session.phase !== "connected") return;
      if (session.customerSpeaking || speakingLock.current) return;
      if (session.currentStep !== stepId) return;
      if (session.checks[stepId] === "done") return;

      const step = STEP_BY_ID[stepId];
      const lead = leadById(session.leadId);
      if (!lead) return;

      const turn = replyToStep(lead, stepId, session.repeats);
      store.pushTranscript("agent", spoken?.trim() || step.say);
      listenerRef.current?.resetBuffer();
      store.setHeard("");

      if (turn.expectRepeat) {
        await afterCustomer(session.leadId, turn);
        return;
      }

      store.markStep(stepId, "done");

      if (stepId === "thanks") {
        await playTurn(turn.text, lead.voiceId);
        finishCall(turn.endWith ?? "completed", "Survey complete. Line released.");
        return;
      }

      await afterCustomer(session.leadId, turn);
    },
    [afterCustomer, finishCall, playTurn],
  );

  markSaidRef.current = markSaid;

  const hangup = useCallback(() => {
    const session = useCallStore.getState().session;
    if (!session) return;
    if (session.phase === "ended") return;
    const disposition: Disposition =
      session.phase === "connected" ? "agent_hangup" : "no_answer";
    playBusy();
    finishCall(disposition, "You hung up.");
  }, [finishCall]);

  const startCall = useCallback(async () => {
    const store = useCallStore.getState();
    const lead = LEADS.find((l) => l.id === store.selectedId);
    if (!lead) {
      store.setLastError("Select a lead first.");
      return;
    }
    if (store.session && store.session.phase !== "ended" && store.session.phase !== "idle") {
      return;
    }
    if (!numbersMatch(store.dialInput, lead.phone)) {
      store.setLastError("Number does not match this lead. Type it from the card.");
      toast.error("Wrong number — type it from the lead card.");
      return;
    }

    stopAudio();
    abortRef.current = new AbortController();
    store.beginSession(lead.id);
    store.pushTranscript("system", `Dialing ${lead.phoneDisplay}`);
    store.setPhase("ringing");
    playLineClick();
    ringStopRef.current = startRingback();

    const pickup = pickupLine(lead);
    void synthesizeSpeech({ data: { text: pickup.text, voiceId: lead.voiceId } }).then((res) => {
      if (res.ok) {
        audioCache.set(`${lead.voiceId}::${pickup.text}`, b64ToBlob(res.audioBase64, res.mimeType));
      }
    });

    const rings = lead.personality === "machine" ? 2600 : lead.personality === "hostile" ? 1400 : 2200;
    await new Promise((r) => setTimeout(r, rings));
    ringStopRef.current?.();
    ringStopRef.current = null;

    const live = useCallStore.getState();
    if (!live.session || live.session.leadId !== lead.id || live.session.phase === "ended") return;

    live.markConnected();
    live.pushTranscript("system", "Connected");
    playLineClick();
    await afterCustomer(lead.id, pickup);
  }, [afterCustomer, stopAudio]);

  useEffect(() => {
    return () => {
      stopAudio();
      stopMic();
    };
  }, [stopAudio, stopMic]);

  return { startCall, markSaid, hangup, startMic, stopMic };
}

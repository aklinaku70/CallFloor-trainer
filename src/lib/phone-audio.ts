let ctx: AudioContext | null = null;

export function getAudioCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  audio: AudioContext,
  freq: number,
  start: number,
  duration: number,
  gainValue: number,
) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.frequency.value = freq;
  osc.type = "sine";
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.012);
  gain.gain.setValueAtTime(gainValue, start + duration - 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration);
}

const DTMF: Record<string, [number, number]> = {
  "1": [697, 1209],
  "2": [697, 1336],
  "3": [697, 1477],
  "4": [770, 1209],
  "5": [770, 1336],
  "6": [770, 1477],
  "7": [852, 1209],
  "8": [852, 1336],
  "9": [852, 1477],
  "*": [941, 1209],
  "0": [941, 1336],
  "#": [941, 1477],
  "+": [941, 1633],
};

export function playDtmf(key: string) {
  const pair = DTMF[key];
  if (!pair) return;
  const audio = getAudioCtx();
  const now = audio.currentTime;
  tone(audio, pair[0], now, 0.11, 0.05);
  tone(audio, pair[1], now, 0.11, 0.05);
}

export function playLineClick() {
  const audio = getAudioCtx();
  const now = audio.currentTime;
  tone(audio, 180, now, 0.05, 0.04);
  tone(audio, 90, now + 0.04, 0.08, 0.03);
}

export function startRingback(): () => void {
  const audio = getAudioCtx();
  let stopped = false;
  let timer: number | null = null;

  const burst = () => {
    if (stopped) return;
    const now = audio.currentTime;
    tone(audio, 425, now, 0.85, 0.045);
    timer = window.setTimeout(burst, 1600);
  };
  burst();

  return () => {
    stopped = true;
    if (timer != null) window.clearTimeout(timer);
  };
}

export function playBusy() {
  const audio = getAudioCtx();
  const now = audio.currentTime;
  for (let i = 0; i < 4; i++) {
    tone(audio, 425, now + i * 0.4, 0.18, 0.05);
  }
}

export function playBeep() {
  const audio = getAudioCtx();
  tone(audio, 1000, audio.currentTime, 0.35, 0.06);
}

export function b64ToBlob(b64: string, mimeType: string): Blob {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

export function playBlob(blob: Blob, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    const cleanup = () => {
      audio.pause();
      audio.removeAttribute("src");
      URL.revokeObjectURL(url);
    };
    const onAbort = () => {
      cleanup();
      resolve();
    };
    if (signal?.aborted) {
      cleanup();
      resolve();
      return;
    }
    signal?.addEventListener("abort", onAbort, { once: true });
    audio.onended = () => {
      signal?.removeEventListener("abort", onAbort);
      cleanup();
      resolve();
    };
    audio.onerror = () => {
      signal?.removeEventListener("abort", onAbort);
      cleanup();
      reject(new Error("audio play failed"));
    };
    void audio.play().catch((err) => {
      signal?.removeEventListener("abort", onAbort);
      cleanup();
      reject(err);
    });
  });
}

export function speakBrowser(text: string, lang: string, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 0.96;
    const voices = window.speechSynthesis.getVoices();
    const de = voices.find((v) => v.lang.toLowerCase().startsWith("de"));
    if (de) utter.voice = de;
    const onAbort = () => {
      window.speechSynthesis.cancel();
      resolve();
    };
    if (signal?.aborted) {
      resolve();
      return;
    }
    signal?.addEventListener("abort", onAbort, { once: true });
    utter.onend = () => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    };
    utter.onerror = () => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    };
    window.speechSynthesis.speak(utter);
  });
}

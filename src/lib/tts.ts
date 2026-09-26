import { createServerFn } from "@tanstack/react-start";

const cache = new Map<string, { audioBase64: string; mimeType: string }>();
const MAX_CACHE = 180;
const MAX_TEXT = 420;

type TtsOk = { ok: true; audioBase64: string; mimeType: string };
type TtsFail = { ok: false; error: string };
export type TtsResult = TtsOk | TtsFail;

async function requestTts(
  apiKey: string,
  text: string,
  voiceId: string,
  language?: string,
): Promise<{ ok: true; bytes: ArrayBuffer; mime: string } | { ok: false; error: string }> {
  const body: Record<string, string> = { text, voice_id: voiceId };
  if (language) body.language = language;

  const res = await fetch("https://api.x.ai/v1/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const mime = res.headers.get("content-type") ?? "audio/mpeg";
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return { ok: false, error: `tts ${res.status}${detail ? `: ${detail.slice(0, 180)}` : ""}` };
  }
  if (mime.includes("application/json")) {
    const detail = await res.text().catch(() => "");
    return { ok: false, error: detail.slice(0, 180) || "tts json error" };
  }
  return { ok: true, bytes: await res.arrayBuffer(), mime };
}

export const synthesizeSpeech = createServerFn({ method: "POST" })
  .validator((input: { text: string; voiceId: string }) => {
    if (!input || typeof input.text !== "string" || typeof input.voiceId !== "string") {
      throw new Error("Invalid TTS payload");
    }
    return {
      text: input.text.trim().slice(0, MAX_TEXT),
      voiceId: input.voiceId.trim().slice(0, 40) || "eve",
    };
  })
  .handler(async ({ data }): Promise<TtsResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "unavailable" };
    if (!data.text) return { ok: false, error: "empty" };

    const key = `${data.voiceId}::${data.text}`;
    const hit = cache.get(key);
    if (hit) return { ok: true, ...hit };

    let result = await requestTts(apiKey, data.text, data.voiceId, "de");
    if (!result.ok) {
      result = await requestTts(apiKey, data.text, data.voiceId);
    }
    if (!result.ok) return { ok: false, error: result.error };

    const audioBase64 = Buffer.from(result.bytes).toString("base64");
    const entry = { audioBase64, mimeType: result.mime.split(";")[0] || "audio/mpeg" };
    if (cache.size >= MAX_CACHE) {
      const first = cache.keys().next().value;
      if (first) cache.delete(first);
    }
    cache.set(key, entry);
    return { ok: true, ...entry };
  });

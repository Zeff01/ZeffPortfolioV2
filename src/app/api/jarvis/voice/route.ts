import { NextResponse, type NextRequest } from "next/server";

/**
 * J.A.R.V.I.S. neural voice: proxies text-to-speech so the provider key never
 * reaches the browser. ElevenLabs is preferred; OpenAI is used when only an
 * OpenAI key is set. With no key at all the route answers 503 and the client
 * falls back to the browser's built-in speech.
 *
 * Every line Jarvis says comes from a small, deterministic set, so responses
 * are cached hard (memory + CDN) — each line is only paid for once.
 */

export const runtime = "nodejs";

const LIMITS = {
  maxChars: 600,
  memoryCacheEntries: 120,
  rateWindowMs: 60_000,
  ratePerWindow: 24,
  maxTrackedIps: 5000,
  /** ElevenLabs plans cap parallel requests (2 on Starter); queue beyond this. */
  maxConcurrentUpstream: Number(process.env.JARVIS_TTS_CONCURRENCY) || 2,
  /** Retries when the provider still answers 429 (concurrency / rate limit). */
  busyRetries: 3,
  busyRetryBaseMs: 600,
} as const;

const CACHE_CONTROL = {
  // The voice you asked for: each line is paid for once, then served from the CDN.
  primary: "public, max-age=86400, s-maxage=31536000, immutable",
  // Stand-in voice: short-lived, so an upgraded plan takes over within the hour.
  fallback: "public, max-age=3600, s-maxage=3600",
} as const;

const ELEVENLABS = {
  url: "https://api.elevenlabs.io/v1/text-to-speech",
  /**
   * "Daniel" — a deep, composed British premade voice that works on every plan.
   * ELEVENLABS_VOICE_ID picks another (e.g. a Voice Library voice); if the
   * account can't use it (library voices need the Creator plan) Daniel stands in.
   */
  defaultVoiceId: "onwK4e9ZLuTAKqWW03F9",
  /** Upstream statuses meaning "this voice isn't available to this account". */
  voiceRejectedStatuses: [400, 401, 402, 403, 404],
  /** After a refusal, skip straight to the default voice for this long. */
  rejectionMemoryMs: 3_600_000,
  defaultModelId: "eleven_multilingual_v2",
  outputFormat: "mp3_44100_128",
  voiceSettings: { stability: 0.6, similarity_boost: 0.8, style: 0.12, use_speaker_boost: true },
} as const;

const OPENAI = {
  url: "https://api.openai.com/v1/audio/speech",
  model: "gpt-4o-mini-tts",
  defaultVoice: "fable",
  instructions:
    "Voice: a calm, refined British AI butler. Received Pronunciation, low and even, dry wit, " +
    "precise diction, unhurried but efficient. Polite and quietly confident, never excitable.",
} as const;

type Provider = "elevenlabs" | "openai";

const audioCache = new Map<string, Spoken>();
/** Same line requested twice at once (e.g. prefetch + speak) shares one upstream call. */
const inFlight = new Map<string, Promise<Spoken | null>>();
const hits = new Map<string, number[]>();
let preferredRejectedAt = 0;

const pickProvider = (): Provider | null => {
  if (process.env.ELEVENLABS_API_KEY) return "elevenlabs";
  if (process.env.OPENAI_API_KEY) return "openai";
  return null;
};

const rateLimited = (ip: string): boolean => {
  const now = Date.now();
  if (hits.size > LIMITS.maxTrackedIps) hits.clear();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < LIMITS.rateWindowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > LIMITS.ratePerWindow;
};

const remember = (key: string, spoken: Spoken) => {
  if (audioCache.size >= LIMITS.memoryCacheEntries) {
    const oldest = audioCache.keys().next().value;
    if (oldest !== undefined) audioCache.delete(oldest);
  }
  audioCache.set(key, spoken);
};

// ── Upstream concurrency gate ────────────────────────────────────────────────
let active = 0;
const waiting: Array<() => void> = [];

const acquire = (): Promise<void> => {
  if (active < LIMITS.maxConcurrentUpstream) {
    active++;
    return Promise.resolve();
  }
  return new Promise((resolve) => waiting.push(resolve));
};

const release = () => {
  const next = waiting.shift();
  if (next) next(); // hand the slot straight over
  else active--;
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** One gated provider call, retrying with backoff while the provider says it's busy. */
const synthesizeGated = async (provider: Provider, text: string, voiceId?: string): Promise<Response> => {
  for (let attempt = 0; ; attempt++) {
    await acquire();
    let res: Response;
    try {
      res = await synthesize(provider, text, voiceId);
      // Read the body while holding the slot, so the upstream request has truly finished.
      if (res.ok) res = new Response(await res.arrayBuffer(), { status: res.status, headers: res.headers });
    } finally {
      release();
    }
    if (res.status !== 429 || attempt >= LIMITS.busyRetries) return res;
    await res.body?.cancel();
    await delay(LIMITS.busyRetryBaseMs * 2 ** attempt + Math.random() * LIMITS.busyRetryBaseMs);
  }
};

const synthesize = async (provider: Provider, text: string, voiceId?: string): Promise<Response> => {
  if (provider === "elevenlabs") {
    return fetch(`${ELEVENLABS.url}/${voiceId ?? ELEVENLABS.defaultVoiceId}?output_format=${ELEVENLABS.outputFormat}`, {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "",
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: process.env.ELEVENLABS_MODEL_ID || ELEVENLABS.defaultModelId,
        voice_settings: ELEVENLABS.voiceSettings,
      }),
    });
  }
  return fetch(OPENAI.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI.model,
      voice: process.env.OPENAI_TTS_VOICE || OPENAI.defaultVoice,
      input: text,
      instructions: OPENAI.instructions,
      response_format: "mp3",
    }),
  });
};

interface Spoken {
  audio: ArrayBuffer;
  fallback: boolean;
}

const audioResponse = ({ audio, fallback }: Spoken) =>
  new NextResponse(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": fallback ? CACHE_CONTROL.fallback : CACHE_CONTROL.primary,
    },
  });

const logUpstream = async (provider: Provider, res: Response) =>
  console.error(`[jarvis-voice] ${provider} ${res.status}: ${await res.text()}`);

/** Speak with the configured voice, dropping to the default ElevenLabs voice if it's refused. */
const speak = async (provider: Provider, text: string): Promise<Spoken | null> => {
  const requested = provider === "elevenlabs" ? process.env.ELEVENLABS_VOICE_ID : undefined;
  const recentlyRejected = Date.now() - preferredRejectedAt < ELEVENLABS.rejectionMemoryMs;
  const preferred = recentlyRejected ? undefined : requested;
  const first = await synthesizeGated(provider, text, preferred);
  if (first.ok) return { audio: await first.arrayBuffer(), fallback: recentlyRejected && !!requested };
  await logUpstream(provider, first);

  const canFallBack =
    !!preferred &&
    preferred !== ELEVENLABS.defaultVoiceId &&
    (ELEVENLABS.voiceRejectedStatuses as readonly number[]).includes(first.status);
  if (!canFallBack) return null;
  preferredRejectedAt = Date.now();

  const second = await synthesizeGated(provider, text);
  if (second.ok) return { audio: await second.arrayBuffer(), fallback: true };
  await logUpstream(provider, second);
  return null;
};

export async function GET(req: NextRequest) {
  const provider = pickProvider();
  if (!provider) return NextResponse.json({ error: "voice not configured" }, { status: 503 });

  const text = (req.nextUrl.searchParams.get("text") ?? "").trim();
  if (!text || text.length > LIMITS.maxChars) {
    return NextResponse.json({ error: "invalid text" }, { status: 400 });
  }

  const key = `${provider}:${text}`;
  const cached = audioCache.get(key);
  if (cached) return audioResponse(cached);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) return NextResponse.json({ error: "slow down" }, { status: 429 });

  try {
    let job = inFlight.get(key);
    if (!job) {
      job = speak(provider, text).finally(() => inFlight.delete(key));
      inFlight.set(key, job);
    }
    const spoken = await job;
    if (!spoken) return NextResponse.json({ error: "voice provider error" }, { status: 502 });
    remember(key, spoken);
    return audioResponse(spoken);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(`[jarvis-voice] ${provider} request failed: ${message}`);
    return NextResponse.json({ error: "voice provider unreachable" }, { status: 502 });
  }
}

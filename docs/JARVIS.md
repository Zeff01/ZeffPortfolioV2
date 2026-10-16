# J.A.R.V.I.S. — Home Page Assistant

The home page hero hosts a live J.A.R.V.I.S. system: a Three.js reactor orb behind
Iron Man, a voice-driven comms panel, a system-vitals readout and a voice waveform.
Visitors can **talk to it** (hands-free speech recognition) or type, and it answers
out loud with a neural British voice.

The home page never scrolls — everything lives inside one fixed viewport.

---

## Quick start

1. Copy the voice settings from `.env.example` into `.env.local`:

   ```bash
   ELEVENLABS_API_KEY=your_key            # elevenlabs.io → Profile → API Keys
   # ELEVENLABS_VOICE_ID=wDsJlOXPqcvIUKdLXjDs   # "Jarvis" voice — Creator plan only
   ```

2. `npm run dev`, open http://localhost:3000 in Chrome / Edge / Safari.
3. Allow the microphone when asked, click anywhere once (browsers mute sites until
   the first interaction), then just speak: _"Hey Jarvis, who is Zeff?"_

No key? Everything still works — Jarvis falls back to the browser's built-in voice.

---

## How a conversation flows

```
 visitor speaks ──► useJarvisListen (Web Speech API, continuous)
                      │  strips "hey jarvis", fixes "Jeff" → "Zeff"
                      ▼
 visitor types ───► JarvisComms.send()
                      │
                      ├─► jarvisBrain.askJarvis()   local intent matcher, no API
                      │      returns { text, action? }
                      ├─► prefetch(reply.text)      voice loads while Jarvis "thinks"
                      ▼
                    deliver() ── say(text, { onStart }) ──► useJarvisVoice
                      │                                      │ GET /api/jarvis/voice?text=…
                      │                                      │ WebAudio "suit comms" filter
                      │   ◄── onStart(durationSec) ──────────┘ analyser → level()
                      ▼
                    captions typed in sync with the voice
                    action runs (navigate / open link / theme / power save / mute)
```

The orb, waveform and vitals all read one shared state from `JarvisProvider`
(`idle` → `thinking` → `responding`), and the orb/waveform pulse with the **real**
voice loudness while audio is playing.

---

## Files

| File | Role |
| --- | --- |
| `src/app/page.tsx` | Hero layout: orb behind Iron Man, comms (bottom-left), vitals (right), waveform |
| `src/components/PortfolioWrapper.tsx` | Locks `/` to a fixed, non-scrolling viewport; hides the footer there |
| `src/components/jarvis/JarvisProvider.tsx` | Shared context: orb state, theme, voice/mic prefs, `say`, `prefetch`, `level` |
| `src/components/jarvis/JarvisComms.tsx` | Chat panel: greeting, streaming captions, quick prompts, mic + speaker toggles |
| `src/components/jarvis/jarvisBrain.ts` | Local Q&A over `src/data/*` (skills, experience, projects, contact) + site actions |
| `src/components/jarvis/useJarvisVoice.ts` | Neural voice playback, prefetch cache, autoplay handling, browser-speech fallback |
| `src/components/jarvis/useJarvisListen.ts` | Hands-free speech recognition with auto-restart and wake-word stripping |
| `src/app/api/jarvis/voice/route.ts` | Server TTS proxy (ElevenLabs / OpenAI), caching, rate limiting |
| `src/components/jarvis/JarvisOrb.tsx` | Three.js displaced wireframe orb + particle ring |
| `src/components/jarvis/VoiceVisualizer.tsx` | Canvas spectrum bars, pulse rings, oscilloscope |
| `src/components/jarvis/JarvisVitals.tsx` | Reactor status, core/render bars, uptime, clock, career stats |
| `src/components/jarvis/theme.ts` | Armor themes (hue), storage keys, state labels |
| `src/components/jarvis/usePref.ts` | SSR-safe `localStorage` preference hook |
| `src/app/globals.css` | `jv-*` styles (panels, bars, chips, bubbles) |

---

## Voice (text-to-speech)

`GET /api/jarvis/voice?text=…` returns `audio/mpeg`. The API key stays on the server.

**Provider choice** — first match wins:

| Env var | Provider | Notes |
| --- | --- | --- |
| `ELEVENLABS_API_KEY` | ElevenLabs (`eleven_multilingual_v2`) | Best quality. Default voice **Daniel** (British, works on the free plan) |
| `OPENAI_API_KEY` | OpenAI `gpt-4o-mini-tts`, voice `fable` | Prompted as a calm, refined British AI butler |
| _(none)_ | — | Route returns `503`; the client uses `speechSynthesis` (en-GB male if available) |

Optional overrides: `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL_ID`, `OPENAI_TTS_VOICE`.

**Preferred voice with automatic fallback.** If `ELEVENLABS_VOICE_ID` is refused
(e.g. Voice Library voices such as "Jarvis" `wDsJlOXPqcvIUKdLXjDs` need the
Creator plan), the route retries with Daniel and remembers the refusal for an hour,
so later lines go straight to Daniel. Fallback audio is CDN-cached for only 1 hour,
so an upgraded plan takes over without a redeploy.

> **On the free plan, leave `ELEVENLABS_VOICE_ID` unset in production.** Then Daniel
> is the primary voice and every line is CDN-cached for a year (paid for once).

**Cost control**

- Jarvis only ever says a small, deterministic set of lines, so caching is very effective:
  in-memory (120 entries) + `Cache-Control: s-maxage=31536000, immutable` on the CDN.
- Max 600 characters per line; 24 uncached requests per IP per minute.
- The greeting is prefetched on page load and the five quick-prompt answers ~9 s later
  (~1,300 characters, once).

**Sound effect** — a light WebAudio chain makes it sound like a voice through the suit:
high-pass 120 Hz → low-pass 9.5 kHz → +4 dB presence at 3.2 kHz, plus an 18 ms
short-delay shimmer (14% wet). Tune it in `FX` inside `useJarvisVoice.ts`.

**Autoplay rule** — browsers mute every site until the visitor clicks/taps/presses a
key once; no site can bypass this. Jarvis still "talks first": the greeting is typed,
its audio is kept, and it plays on the first interaction. Until then the panel shows
_"Click or tap anywhere to let me speak"_.

---

## Listening (speech recognition)

- Uses the browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`).
  Supported in Chrome, Edge and Safari; in Firefox the mic button is hidden and typing still works.
- Mic is **on by default** (`jarvis.mic` in `localStorage`); the 🎤 button toggles it.
- The mic closes while Jarvis is thinking or talking and reopens 450 ms after, so he never hears himself.
- Chrome ends recognition sessions on silence; the hook restarts them automatically
  (with back-off after network errors, giving up after 3).
- Saying "Jarvis" is optional: leading "hey/ok/hi jarvis" is stripped.
- Common mishearings of the name ("Jeff", "Zef", "Zeph") are corrected to "Zeff".
- Requires HTTPS in production (Vercel is fine) or `localhost` in development.
- Chrome sends recognition audio to Google's speech service; nothing is stored by this site.

---

## What Jarvis knows (`jarvisBrain.ts`)

Runs entirely in the browser — no LLM call. Intents include: greetings, who is Zeff,
skills (and per category), experience / company names, projects / project names,
blockchain, AI, resume, GitHub, LinkedIn, contact / hire, and Jarvis itself.

Commands it can execute:

| Say / type | Action |
| --- | --- |
| "go to projects", "take me to about" | navigates (after the reply) |
| "github", "linkedin", "resume" | opens the link in a new tab |
| "hulk theme", "stealth color", "gold theme" … | switches armor hue (needs the word "theme"/"color") |
| "power save on/off" | throttles the orb / waveform to ~15 fps |
| "mute" / "unmute" | voice on/off |
| "clear" | clears the chat |
| "help" | lists what it can do |

To teach it something new, add an entry to the `INTENTS` array, or update the data in
`src/data/` (experience, projects, skills) — answers are generated from it.

---

## Preferences (localStorage)

| Key | Default | Meaning |
| --- | --- | --- |
| `jarvis.theme` | `mark` | Armor hue (Mark III, Gold, Arc Cyan, Hulk, Stealth, Vibranium) |
| `jarvis.voice` | `1` | Jarvis speaks |
| `jarvis.mic` | `1` | Hands-free listening |
| `jarvis.powerSave` | `0` | Reduced frame rate |

All animation respects `prefers-reduced-motion`, and the orb pauses when off-screen.

---

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Jarvis types but is silent | Click anywhere once (autoplay rule). Check the speaker icon isn't muted. |
| Robotic voice | No TTS key loaded — set `ELEVENLABS_API_KEY` in `.env.local` and restart `npm run dev`. |
| "Microphone unavailable" | Mic permission denied or no mic — allow it via the address-bar icon and reload. |
| No mic button | Browser has no Web Speech API (Firefox). |
| Voice starts late on new lines | First-time lines are generated by ElevenLabs (~1–2 s); repeats are cached. |
| `[jarvis-voice] elevenlabs 400 … creator tier` in server logs | The chosen voice needs a paid plan; Daniel is being used instead (expected). |
| `[jarvis-voice] … 401` | Invalid/rotated key — update `ELEVENLABS_API_KEY`. |

---

## Credits

The orb, voice visualizer, comms and system-monitor concepts are adapted from
[openclaw-jarvis-ui](https://github.com/jincocodev/openclaw-jarvis-ui) (ISC License),
itself based on Filip Zrnzevic's Three.js Orb Visualizer, and reworked into the
portfolio's Iron Man hero. The voices are original ElevenLabs/OpenAI voices — not a
clone of any actor.

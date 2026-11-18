import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

/** The card Slack, LinkedIn, X and iMessage show when someone shares the site. */

export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COLORS = {
  bg: "#0a0606",
  red: "#b3201b",
  redDeep: "#5a0d0b",
  cyan: "#3fe0f0",
  gold: "#f6c445",
  text: "#f4f1ee",
  dim: "#b9a9a4",
} as const;

const RING_SIZES = [420, 320, 220] as const;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: `linear-gradient(115deg, ${COLORS.bg} 0%, ${COLORS.bg} 52%, ${COLORS.redDeep} 52%, ${COLORS.red} 100%)`,
          color: COLORS.text,
          fontFamily: "sans-serif",
        }}
      >
        {/* Arc-reactor rings */}
        <div
          style={{
            position: "absolute",
            right: 70,
            top: 105,
            width: RING_SIZES[0],
            height: RING_SIZES[0],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {RING_SIZES.map((s, i) => (
            <div
              key={s}
              style={{
                position: "absolute",
                width: s,
                height: s,
                borderRadius: s,
                border: `${i === 1 ? 6 : 2}px solid ${COLORS.cyan}`,
                opacity: i === 1 ? 0.85 : 0.45,
                boxShadow: `0 0 40px ${COLORS.cyan}`,
              }}
            />
          ))}
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 110,
              background: COLORS.cyan,
              boxShadow: `0 0 90px 30px ${COLORS.cyan}`,
              opacity: 0.9,
            }}
          />
        </div>

        {/* HUD frame corners */}
        <div style={{ position: "absolute", left: 36, top: 36, width: 60, height: 60, borderLeft: `4px solid ${COLORS.cyan}`, borderTop: `4px solid ${COLORS.cyan}` }} />
        <div style={{ position: "absolute", right: 36, bottom: 36, width: 60, height: 60, borderRight: `4px solid ${COLORS.cyan}`, borderBottom: `4px solid ${COLORS.cyan}` }} />

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px", width: 720 }}>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 6, color: COLORS.cyan }}>J.A.R.V.I.S. // PORTFOLIO</div>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 800, marginTop: 18, lineHeight: 1 }}>{SITE.name}</div>
          <div style={{ display: "flex", fontSize: 34, color: COLORS.gold, marginTop: 22, lineHeight: 1.25 }}>{SITE.role}</div>
          <div style={{ display: "flex", fontSize: 24, color: COLORS.dim, marginTop: 18, lineHeight: 1.4 }}>
            {SITE.shortDescription}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", marginTop: 30 }}>
            {SITE.stack.map((t) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  fontSize: 22,
                  padding: "8px 18px",
                  marginRight: 12,
                  marginBottom: 12,
                  border: `2px solid ${COLORS.cyan}`,
                  color: COLORS.text,
                  background: "rgba(63, 224, 240, 0.08)",
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}

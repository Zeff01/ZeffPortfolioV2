import React from "react";
import { Document, Font, Image, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ResumeData, ResumeRole } from "./resume";

/**
 * The downloadable CV: a dark header with photo, a headline-numbers strip, a
 * sidebar (contact, skills, education) and a main column (profile, experience
 * timeline, project cards). Text stays real and selectable — the main column
 * reads top-to-bottom, so applicant-tracking systems still parse it.
 */

// Never split words across lines ("mar-keting") — it reads badly and breaks keyword matching.
Font.registerHyphenationCallback((word) => [word]);

const COLORS = {
  night: "#0b1220",
  nightSoft: "#16213a",
  ink: "#0f172a",
  body: "#334155",
  muted: "#64748b",
  faint: "#94a3b8",
  accent: "#0891b2",
  accentSoft: "#e0f2f7",
  gold: "#fbbf24",
  sidebar: "#f4f7fa",
  rule: "#dbe3ea",
  white: "#ffffff",
  onNight: "#cbd5e1",
} as const;

const SIZES = {
  name: 25,
  headline: 10.5,
  section: 9,
  body: 8.6,
  small: 7.6,
  tiny: 6.8,
  statValue: 16,
} as const;

/** A4 height in points: `bottom`-anchored fixed elements don't render in react-pdf 4, so the footer is placed from the top. */
const A4_HEIGHT = 841.89;

const LAYOUT = {
  pageX: 30,
  sidebarWidth: 168,
  gutter: 20,
  photo: 78,
  headerHeight: 128,
  timelineDot: 7,
  /** Top margin on continuation pages; page 1's header bleeds up over it. */
  pageTop: 30,
} as const;

const styles = StyleSheet.create({
  page: {
    paddingTop: LAYOUT.pageTop,
    paddingBottom: 34,
    fontFamily: "Helvetica",
    fontSize: SIZES.body,
    color: COLORS.body,
    lineHeight: 1.42,
  },
  // Painted on every page so the sidebar tint runs the full height.
  sidebarBg: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: LAYOUT.pageX + LAYOUT.sidebarWidth + LAYOUT.gutter / 2,
    backgroundColor: COLORS.sidebar,
  },

  // ── Header ──
  header: {
    marginTop: -LAYOUT.pageTop,
    backgroundColor: COLORS.night,
    paddingHorizontal: LAYOUT.pageX,
    paddingTop: 26,
    paddingBottom: 22,
    flexDirection: "row",
    alignItems: "center",
  },
  qrBox: { alignItems: "center", marginLeft: 14 },
  qrFrame: { backgroundColor: COLORS.white, borderRadius: 4, padding: 3 },
  qr: { width: 58, height: 58 },
  qrCaption: { fontSize: SIZES.tiny, color: COLORS.onNight, marginTop: 4 },
  // One-page version: tighter vertical rhythm.
  compactSection: { marginBottom: 9 },
  compactRoleBody: { paddingBottom: 6 },
  skillInline: { fontSize: SIZES.small, color: COLORS.body, lineHeight: 1.35 },
  skillInlineName: { fontFamily: "Helvetica-Bold", color: COLORS.ink },
  compactSkillGroup: { marginBottom: 4 },
  projectRow: { borderLeftWidth: 2, borderLeftColor: COLORS.accent, paddingLeft: 7, marginBottom: 6 },
  earlierInline: { fontSize: SIZES.small, color: COLORS.body },
  headerAccent: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: COLORS.accent,
  },
  photoRing: {
    width: LAYOUT.photo + 6,
    height: LAYOUT.photo + 6,
    borderRadius: (LAYOUT.photo + 6) / 2,
    borderWidth: 2,
    borderColor: COLORS.accent,
    padding: 1,
    marginRight: 18,
  },
  photo: {
    width: LAYOUT.photo,
    height: LAYOUT.photo,
    borderRadius: LAYOUT.photo / 2,
  },
  headerText: { flex: 1 },
  kicker: {
    fontSize: SIZES.tiny,
    color: COLORS.accent,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  name: {
    fontFamily: "Helvetica-Bold",
    fontSize: SIZES.name,
    lineHeight: 1.1,
    color: COLORS.white,
  },
  headline: {
    fontSize: SIZES.headline,
    lineHeight: 1.3,
    color: COLORS.gold,
    marginTop: 4,
  },
  location: { fontSize: SIZES.small, color: COLORS.onNight, marginTop: 5 },

  // ── Stats strip ──
  stats: {
    flexDirection: "row",
    backgroundColor: COLORS.nightSoft,
    paddingHorizontal: LAYOUT.pageX,
    paddingVertical: 9,
  },
  stat: { flex: 1, alignItems: "center" },
  statDivider: { borderLeftWidth: 0.5, borderLeftColor: "#2c3a57" },
  statValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: SIZES.statValue,
    lineHeight: 1.1,
    color: COLORS.white,
  },
  statLabel: { fontSize: SIZES.tiny, color: COLORS.faint, marginTop: 1 },

  // ── Body ──
  body: {
    flexDirection: "row",
    paddingHorizontal: LAYOUT.pageX,
    paddingTop: 16,
  },
  sidebar: { width: LAYOUT.sidebarWidth, marginRight: LAYOUT.gutter },
  main: { flex: 1 },

  section: { marginBottom: 13 },
  sectionHead: { flexDirection: "row", alignItems: "center", marginBottom: 7 },
  sectionBar: {
    width: 12,
    height: 2.5,
    backgroundColor: COLORS.accent,
    marginRight: 6,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: SIZES.section,
    color: COLORS.ink,
    // No letter-spacing: spaced capitals extract as "P R O F I L E" in applicant-tracking systems.
    textTransform: "uppercase",
  },

  // Sidebar pieces
  contactItem: { marginBottom: 5 },
  contactLabel: {
    fontSize: SIZES.tiny,
    color: COLORS.muted,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  contactValue: {
    fontSize: SIZES.small,
    color: COLORS.ink,
    textDecoration: "none",
  },
  skillGroup: { marginBottom: 7 },
  skillGroupName: {
    fontFamily: "Helvetica-Bold",
    fontSize: SIZES.small,
    color: COLORS.ink,
    marginBottom: 3,
  },
  chips: { flexDirection: "row", flexWrap: "wrap" },
  chip: {
    fontSize: SIZES.tiny,
    color: COLORS.body,
    backgroundColor: COLORS.white,
    borderWidth: 0.5,
    borderColor: COLORS.rule,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    marginRight: 3,
    marginBottom: 3,
  },
  chipCore: {
    color: COLORS.white,
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  eduSchool: {
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    fontSize: SIZES.small,
  },
  eduDegree: { fontSize: SIZES.small, marginTop: 1 },
  eduPeriod: { fontSize: SIZES.tiny, color: COLORS.muted, marginTop: 2 },

  // Main pieces
  summary: { fontSize: SIZES.body, color: COLORS.body },
  role: { flexDirection: "row" },
  rail: { width: 14, alignItems: "center" },
  dot: {
    width: LAYOUT.timelineDot,
    height: LAYOUT.timelineDot,
    borderRadius: LAYOUT.timelineDot / 2,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    backgroundColor: COLORS.white,
    marginTop: 2.5,
  },
  dotCurrent: { backgroundColor: COLORS.accent },
  line: { flex: 1, width: 1, backgroundColor: COLORS.rule, marginTop: 2 },
  roleBody: { flex: 1, paddingLeft: 6, paddingBottom: 9 },
  roleHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  roleTitle: {
    flex: 1,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    fontSize: 9.2,
    paddingRight: 6,
  },
  period: {
    fontSize: SIZES.tiny,
    color: COLORS.accent,
    backgroundColor: COLORS.accentSoft,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  company: {
    fontSize: SIZES.small,
    color: COLORS.accent,
    fontFamily: "Helvetica-Bold",
  },
  companyLocation: { color: COLORS.muted, fontFamily: "Helvetica" },
  bullet: { flexDirection: "row", marginTop: 2 },
  bulletMark: { width: 8, color: COLORS.accent, fontFamily: "Helvetica-Bold" },
  bulletText: { flex: 1 },
  roleSummary: { marginTop: 2 },
  earlier: { marginTop: 2, paddingLeft: 20 },
  earlierTitle: {
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    fontSize: SIZES.small,
    marginBottom: 3,
  },
  earlierRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    fontSize: SIZES.small,
  },
  earlierPeriod: { color: COLORS.muted, fontSize: SIZES.tiny },

  projects: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  project: {
    width: "48.5%",
    borderWidth: 0.5,
    borderColor: COLORS.rule,
    borderLeftWidth: 2.5,
    borderLeftColor: COLORS.accent,
    borderRadius: 3,
    padding: 7,
    marginBottom: 7,
  },
  projectHead: { flexDirection: "row", justifyContent: "space-between" },
  projectTitle: {
    flex: 1,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    fontSize: SIZES.body,
    paddingRight: 4,
  },
  projectYear: { fontSize: SIZES.tiny, color: COLORS.muted },
  projectRole: { fontSize: SIZES.tiny, color: COLORS.accent, marginBottom: 2 },
  projectDesc: { fontSize: SIZES.small, lineHeight: 1.38 },
  projectStack: { fontSize: SIZES.tiny, color: COLORS.muted, marginTop: 3 },

  footer: {
    position: "absolute",
    top: A4_HEIGHT - 24,
    left: LAYOUT.pageX,
    right: LAYOUT.pageX,
  },
  footerText: {
    fontSize: SIZES.tiny,
    color: COLORS.faint,
    textAlign: "right",
  },
});

function Section({ title, children, compact }: { title: string; children: React.ReactNode; compact?: boolean }) {
  return (
    <View style={compact ? [styles.section, styles.compactSection] : styles.section}>
      <View style={styles.sectionHead} wrap={false}>
        <View style={styles.sectionBar} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

/** "20+ Satisfied Clients" → { value: "20+", label: "Satisfied Clients" }. */
const splitStat = (text: string) => {
  const m = text.match(/^(\S+)\s+(.+)$/);
  return m ? { value: m[1], label: m[2] } : { value: text, label: "" };
};

const CONTACT_LABELS: [RegExp, string][] = [
  [/^mailto:/, "Email"],
  [/^tel:/, "Phone"],
  [/linkedin\.com/, "LinkedIn"],
  [/github\.com/, "GitHub"],
  [/^https?:/, "Portfolio"],
];
const contactLabel = (href: string) => CONTACT_LABELS.find(([re]) => re.test(href))?.[1] ?? "Link";

function Role({
  role,
  current,
  last,
  compact,
}: {
  role: ResumeRole;
  current: boolean;
  last: boolean;
  compact: boolean;
}) {
  return (
    <View style={styles.role} wrap={false}>
      <View style={styles.rail}>
        <View style={current ? [styles.dot, styles.dotCurrent] : styles.dot} />
        {!last && <View style={styles.line} />}
      </View>
      <View style={compact ? [styles.roleBody, styles.compactRoleBody] : styles.roleBody}>
        <View style={styles.roleHead}>
          <Text style={styles.roleTitle}>{role.position}</Text>
          <Text style={styles.period}>{role.period}</Text>
        </View>
        <Text style={styles.company}>
          {role.company}
          <Text style={styles.companyLocation}> · {role.location}</Text>
        </Text>
        {role.bullets?.length ? (
          role.bullets.map((b) => (
            <View key={b} style={styles.bullet}>
              <Text style={styles.bulletMark}>›</Text>
              <Text style={styles.bulletText}>{b}</Text>
            </View>
          ))
        ) : role.summary ? (
          <Text style={styles.roleSummary}>{role.summary}</Text>
        ) : null}
      </View>
    </View>
  );
}

export interface ResumeDocumentProps {
  resume: ResumeData;
  /** Where this copy was generated from, shown in the footer. */
  source: string;
  /** Headshot (JPEG bytes); the header drops the photo when absent. */
  photo?: Buffer;
  /** QR code PNG linking to the live portfolio. */
  qr?: Buffer;
  /** The condensed single-page layout. */
  compact?: boolean;
}

export function ResumeDocument({ resume, source, photo, qr, compact = false }: ResumeDocumentProps) {
  return (
    <Document title={`${resume.name} — Résumé`} author={resume.name} subject={resume.headline}>
      <Page size="A4" style={styles.page}>
        <View style={styles.sidebarBg} fixed />

        <View style={styles.header}>
          {photo && (
            <View style={styles.photoRing}>
              {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop */}
              <Image src={{ data: photo, format: "jpg" }} style={styles.photo} />
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.kicker}>RÉSUMÉ</Text>
            <Text style={styles.name}>{resume.name}</Text>
            <Text style={styles.headline}>{resume.headline}</Text>
            <Text style={styles.location}>{resume.location}</Text>
          </View>
          {qr && (
            <View style={styles.qrBox}>
              <Link src={`https://${source}`} style={styles.qrFrame}>
                {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop */}
                <Image src={{ data: qr, format: "png" }} style={styles.qr} />
              </Link>
              <Text style={styles.qrCaption}>Live portfolio</Text>
            </View>
          )}
          <View style={styles.headerAccent} />
        </View>

        {resume.highlights.length > 0 && (
          <View style={styles.stats}>
            {resume.highlights.map((h, i) => {
              const { value, label } = splitStat(h);
              return (
                <View key={h} style={i > 0 ? [styles.stat, styles.statDivider] : styles.stat}>
                  <Text style={styles.statValue}>{value}</Text>
                  <Text style={styles.statLabel}>{label}</Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.body}>
          <View style={styles.sidebar}>
            <Section title="Contact" compact={compact}>
              {resume.contact.map((c) => (
                <View key={c.href} style={styles.contactItem}>
                  <Text style={styles.contactLabel}>{contactLabel(c.href)}</Text>
                  <Link src={c.href} style={styles.contactValue}>
                    {c.label}
                  </Link>
                </View>
              ))}
            </Section>

            <Section title="Skills" compact={compact}>
              {resume.skills.map((g) => {
                const core = g.name === "Core";
                return (
                  <View key={g.name} style={compact ? styles.compactSkillGroup : styles.skillGroup} wrap={false}>
                    {compact && !core ? (
                      // One line per group on the single-page version: "Frontend: HTML, CSS, …".
                      <Text style={styles.skillInline}>
                        <Text style={styles.skillInlineName}>{g.name}: </Text>
                        {g.skills.join(", ")}
                      </Text>
                    ) : (
                      <Text style={styles.skillGroupName}>{core ? "Core strengths" : g.name}</Text>
                    )}
                    {compact && !core ? null : (
                      <View style={styles.chips}>
                        {g.skills.map((s) => (
                          <Text key={s} style={core ? [styles.chip, styles.chipCore] : styles.chip}>
                            {s}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </Section>

            <Section title="Education" compact={compact}>
              {resume.education.map((e) => (
                <View key={e.school} wrap={false}>
                  <Text style={styles.eduSchool}>{e.school}</Text>
                  <Text style={styles.eduDegree}>{e.degree}</Text>
                  <Text style={styles.eduPeriod}>{e.period}</Text>
                </View>
              ))}
            </Section>
          </View>

          <View style={styles.main}>
            <Section title="Profile" compact={compact}>
              <Text style={styles.summary}>{resume.summary}</Text>
            </Section>

            <Section title="Experience" compact={compact}>
              {resume.roles.map((r, i) => (
                <Role
                  key={`${r.company}-${r.position}-${r.period}`}
                  role={r}
                  compact={compact}
                  current={/present/i.test(r.period)}
                  last={i === resume.roles.length - 1}
                />
              ))}
              {resume.earlierRoles.length > 0 && compact && (
                <View style={styles.earlier} wrap={false}>
                  <Text style={styles.earlierTitle}>Earlier roles</Text>
                  <Text style={styles.earlierInline}>{resume.earlierRoles.map((r) => r.company).join(" · ")}</Text>
                </View>
              )}
              {resume.earlierRoles.length > 0 && !compact && (
                <View style={styles.earlier} wrap={false}>
                  <Text style={styles.earlierTitle}>Earlier roles</Text>
                  {resume.earlierRoles.map((r) => (
                    <View key={`${r.company}-${r.position}-${r.period}`} style={styles.earlierRow}>
                      <Text>
                        {r.position} · {r.company}
                      </Text>
                      <Text style={styles.earlierPeriod}>{r.period}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Section>

            <Section title="Selected Projects" compact={compact}>
              {compact ? (
                resume.projects.map((p) => (
                  <View key={p.title} style={styles.projectRow} wrap={false}>
                    <View style={styles.projectHead}>
                      <Text style={styles.projectTitle}>
                        {p.title}
                        <Text style={styles.projectRole}> · {p.role}</Text>
                      </Text>
                      <Text style={styles.projectYear}>{p.year}</Text>
                    </View>
                    <Text style={styles.projectDesc}>{p.description}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.projects}>
                  {resume.projects.map((p) => (
                    <View key={p.title} style={styles.project} wrap={false}>
                      <View style={styles.projectHead}>
                        <Text style={styles.projectTitle}>{p.title}</Text>
                        <Text style={styles.projectYear}>{p.year}</Text>
                      </View>
                      <Text style={styles.projectRole}>{p.role}</Text>
                      <Text style={styles.projectDesc}>{p.description}</Text>
                      {p.stack.length > 0 && <Text style={styles.projectStack}>{p.stack.join(" · ")}</Text>}
                    </View>
                  ))}
                </View>
              )}
            </Section>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Generated live from ${source}  ·  ${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}

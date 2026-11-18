import React from "react";
import { Document, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ResumeData } from "./resume";

/**
 * The downloadable CV: single column, real selectable text, standard fonts —
 * reads cleanly for people and parses cleanly for applicant-tracking systems.
 */

const COLORS = {
  ink: "#111418",
  body: "#2b3036",
  muted: "#5f6873",
  accent: "#b3261e",
  rule: "#d9dde2",
} as const;

const SIZES = {
  name: 22,
  headline: 11,
  section: 9.5,
  body: 9,
  small: 8,
} as const;

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 42,
    fontFamily: "Helvetica",
    fontSize: SIZES.body,
    color: COLORS.body,
    lineHeight: 1.4,
  },
  // Explicit line height: the page-level one is relative to body text and makes the name collide with the headline.
  name: { fontFamily: "Helvetica-Bold", fontSize: SIZES.name, lineHeight: 1.15, color: COLORS.ink },
  headline: { fontSize: SIZES.headline, lineHeight: 1.3, color: COLORS.accent, marginTop: 4 },
  contactRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 6, color: COLORS.muted, fontSize: SIZES.small },
  contactItem: { marginRight: 10 },
  link: { color: COLORS.muted, textDecoration: "none" },
  section: { marginTop: 13 },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: SIZES.section,
    color: COLORS.accent,
    // No letter-spacing: spaced capitals extract as "P R O F I L E" in applicant-tracking systems.
    textTransform: "uppercase",
    paddingBottom: 3,
    marginBottom: 6,
    borderBottomWidth: 0.75,
    borderBottomColor: COLORS.rule,
  },
  highlights: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  highlight: { fontFamily: "Helvetica-Bold", color: COLORS.ink, marginRight: 12, fontSize: SIZES.small },
  entry: { marginBottom: 7 },
  entryHead: { flexDirection: "row", justifyContent: "space-between" },
  entryTitle: { fontFamily: "Helvetica-Bold", color: COLORS.ink },
  entryMeta: { color: COLORS.muted, fontSize: SIZES.small },
  entryBody: { marginTop: 1.5 },
  bullet: { flexDirection: "row", marginTop: 1.5 },
  bulletMark: { width: 9, color: COLORS.accent },
  bulletText: { flex: 1 },
  compactRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  skillRow: { flexDirection: "row", marginBottom: 2.5 },
  skillLabel: { width: 72, fontFamily: "Helvetica-Bold", color: COLORS.ink },
  skillList: { flex: 1 },
  footer: { position: "absolute", bottom: 20, left: 42, right: 42, fontSize: 7, color: COLORS.muted, textAlign: "center" },
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export interface ResumeDocumentProps {
  resume: ResumeData;
  /** Where this copy was generated from, shown in the footer. */
  source: string;
}

export function ResumeDocument({ resume, source }: ResumeDocumentProps) {
  return (
    <Document title={`${resume.name} — Résumé`} author={resume.name} subject={resume.headline}>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.name}>{resume.name}</Text>
          <Text style={styles.headline}>{resume.headline}</Text>
          <View style={styles.contactRow}>
            <Text style={styles.contactItem}>{resume.location}</Text>
            {resume.contact.map((c) => (
              <Link key={c.href} src={c.href} style={[styles.contactItem, styles.link]}>
                {c.label}
              </Link>
            ))}
          </View>
        </View>

        <Section title="Profile">
          <Text>{resume.summary}</Text>
          <View style={styles.highlights}>
            {resume.highlights.map((h) => (
              <Text key={h} style={styles.highlight}>
                {h}
              </Text>
            ))}
          </View>
        </Section>

        <Section title="Experience">
          {resume.roles.map((r) => (
            <View key={`${r.company}-${r.position}-${r.period}`} style={styles.entry} wrap={false}>
              <View style={styles.entryHead}>
                <Text style={styles.entryTitle}>
                  {r.position} · {r.company}
                </Text>
                <Text style={styles.entryMeta}>{r.period}</Text>
              </View>
              <Text style={styles.entryMeta}>{r.location}</Text>
              {r.bullets?.length ? (
                r.bullets.map((b) => (
                  <View key={b} style={styles.bullet}>
                    <Text style={styles.bulletMark}>•</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))
              ) : r.summary ? (
                <Text style={styles.entryBody}>{r.summary}</Text>
              ) : null}
            </View>
          ))}
          {resume.earlierRoles.length > 0 && (
            <View style={{ marginTop: 2 }}>
              <Text style={[styles.entryTitle, { marginBottom: 3 }]}>Earlier roles</Text>
              {resume.earlierRoles.map((r) => (
                <View key={`${r.company}-${r.position}-${r.period}`} style={styles.compactRow}>
                  <Text>
                    {r.position} · {r.company}, {r.location}
                  </Text>
                  <Text style={styles.entryMeta}>{r.period}</Text>
                </View>
              ))}
            </View>
          )}
        </Section>

        <Section title="Selected Projects">
          {resume.projects.map((p) => (
            <View key={p.title} style={styles.entry} wrap={false}>
              <View style={styles.entryHead}>
                <Text style={styles.entryTitle}>
                  {p.title} · {p.role}
                </Text>
                <Text style={styles.entryMeta}>{p.year}</Text>
              </View>
              <Text style={styles.entryBody}>{p.description}</Text>
              {p.stack.length > 0 && <Text style={styles.entryMeta}>{p.stack.join(" · ")}</Text>}
            </View>
          ))}
        </Section>

        <Section title="Skills">
          {resume.skills.map((g) => (
            <View key={g.name} style={styles.skillRow}>
              <Text style={styles.skillLabel}>{g.name}</Text>
              <Text style={styles.skillList}>{g.skills.join(", ")}</Text>
            </View>
          ))}
        </Section>

        <Section title="Education">
          {resume.education.map((e) => (
            <View key={e.school} style={styles.entry}>
              <View style={styles.entryHead}>
                <Text style={styles.entryTitle}>{e.school}</Text>
                <Text style={styles.entryMeta}>{e.period}</Text>
              </View>
              <Text>{e.degree}</Text>
            </View>
          ))}
        </Section>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `${source}  ·  ${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}
